import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import sharp from "sharp";

import db from "@sellspace/db";
import { requireAuth } from "@/middleware/auth";
import { deleteFromR2, generateR2Key, uploadToR2, validateFileSize, validateMimeType } from "@/lib/r2";

const app = new Hono();

// ─── Upload profile picture ────────────────────────────────────────────────────

const uploadProfileSchema = z.object({
  file: z.instanceof(File),
});

app.post(
  "/profile",
  requireAuth,
  zValidator("form", uploadProfileSchema),
  async (c) => {
    const userId = c.get("userId");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const { file } = c.req.valid("form");

    // Validate file size (max 2MB for profile pictures)
    const buffer = await file.arrayBuffer();
    if (!validateFileSize(Buffer.from(buffer), 2097152)) {
      return c.json({ error: "File too large (max 2MB)" }, 400);
    }

    // Validate mimetype
    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
    if (!validateMimeType(file.type, allowedMimes)) {
      return c.json({ error: "Invalid file type. Must be JPEG, PNG, or WebP" }, 400);
    }

    const publicOrigin = new URL(c.req.url).origin;

    try {
      const normalizedBuffer = await sharp(Buffer.from(buffer))
        .resize(512, 512, { fit: "cover", position: "centre" })
        .jpeg({ quality: 90 })
        .toBuffer();

      // Delete old avatar if exists
      const user = await db.user.findUnique({ where: { id: userId } });
      if (user?.avatarUrl) {
        const oldKey = user.avatarUrl.split("/").pop();
        if (oldKey) {
          try {
            await deleteFromR2(`avatars/${oldKey}`);
          } catch {
            // Ignore deletion errors
          }
        }
      }

      // Upload new avatar
      const avatarFileName = `${file.name.replace(/\.[^.]+$/, "") || "avatar"}.jpg`;
      const key = generateR2Key("avatars", avatarFileName);
      const url = await uploadToR2({
        key,
        contentType: "image/jpeg",
        buffer: normalizedBuffer,
      }, publicOrigin);

      // Update user
      const updated = await db.user.update({
        where: { id: userId },
        data: { avatarUrl: url },
      });

      return c.json({ avatarUrl: updated.avatarUrl });
    } catch (err) {
      console.error("Upload error:", err);
      return c.json({ error: "Upload failed" }, 500);
    }
  },
);

// ─── Upload listing images ────────────────────────────────────────────────────

const uploadListingSchema = z.object({
  listingId: z.string().min(1),
  files: z
    .union([z.instanceof(File), z.array(z.instanceof(File))])
    .transform((val) => (Array.isArray(val) ? val : [val])),
});

app.post(
  "/listing",
  requireAuth,
  zValidator("form", uploadListingSchema),
  async (c) => {
    const userId = c.get("userId");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const { listingId, files } = c.req.valid("form");

    // Verify listing ownership
    const listing = await db.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing || listing.sellerId !== userId) {
      return c.json({ error: "Listing not found or unauthorized" }, 404);
    }

    const publicOrigin = new URL(c.req.url).origin;

    try {
      const urls: string[] = [];

      // Upload each file
      for (const file of files) {
        // Validate file size (max 5MB per image)
        const buffer = await file.arrayBuffer();
        if (!validateFileSize(Buffer.from(buffer), 5242880)) {
          return c.json({ error: "File too large (max 5MB per image)" }, 400);
        }

        // Validate mimetype
        const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
        if (!validateMimeType(file.type, allowedMimes)) {
          return c.json({ error: "Invalid file type. Must be JPEG, PNG, or WebP" }, 400);
        }

        // Upload
        const key = generateR2Key(`listings/${listingId}`, file.name);
        const url = await uploadToR2({
          key,
          contentType: file.type,
          buffer: Buffer.from(buffer),
        }, publicOrigin);

        urls.push(url);
      }

      // Add images to listing
      const images = await Promise.all(
        urls.map((url, i) =>
          db.listingImage.create({
            data: {
              listingId,
              url,
              order: i,
            },
          }),
        ),
      );

      return c.json({ images });
    } catch (err) {
      console.error("Upload error:", err);
      return c.json({ error: "Upload failed" }, 500);
    }
  },
);

// ─── Delete listing image ────────────────────────────────────────────────────

const deleteImageSchema = z.object({
  imageId: z.string().min(1),
});

app.delete(
  "/listing/:imageId",
  requireAuth,
  zValidator("json", deleteImageSchema),
  async (c) => {
    const userId = c.get("userId");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const imageId = c.req.param("imageId");
    const { imageId: bodyImageId } = c.req.valid("json");

    // Ensure imageId from param matches body
    if (imageId !== bodyImageId) {
      return c.json({ error: "Image ID mismatch" }, 400);
    }

    try {
      // Get image and verify ownership
      const image = await db.image.findUnique({
        where: { id: imageId },
        include: { listing: true },
      });

      if (!image || image.listing.sellerId !== userId) {
        return c.json({ error: "Image not found or unauthorized" }, 404);
      }

      // Delete from R2
      const key = image.url.split("/").pop();
      if (key) {
        await deleteFromR2(`listings/${image.listing.id}/${key}`);
      }

      // Delete from database
      await db.image.delete({ where: { id: imageId } });

      return c.json({ success: true });
    } catch (err) {
      console.error("Delete error:", err);
      return c.json({ error: "Delete failed" }, 500);
    }
  },
);

// ─── Upload chat / message image ─────────────────────────────────────────────

const uploadMessageImageSchema = z.object({
  file: z.instanceof(File),
});

app.post(
  "/message",
  requireAuth,
  zValidator("form", uploadMessageImageSchema),
  async (c) => {
    const userId = c.get("userId");
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const { file } = c.req.valid("form");

    const buffer = await file.arrayBuffer();

    // Max 10 MB for chat images
    if (!validateFileSize(Buffer.from(buffer), 10485760)) {
      return c.json({ error: "File too large (max 10MB)" }, 400);
    }

    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validateMimeType(file.type, allowedMimes)) {
      return c.json({ error: "Invalid file type. Must be JPEG, PNG, WebP, or GIF" }, 400);
    }

    const publicOrigin = new URL(c.req.url).origin;

    try {
      const key = generateR2Key(`messages/${userId}`, file.name);
      const imageUrl = await uploadToR2(
        { key, contentType: file.type, buffer: Buffer.from(buffer) },
        publicOrigin,
      );

      return c.json({ imageUrl });
    } catch (err) {
      console.error("Message image upload error:", err);
      return c.json({ error: "Upload failed" }, 500);
    }
  },
);

export const uploadRoutes = app;
