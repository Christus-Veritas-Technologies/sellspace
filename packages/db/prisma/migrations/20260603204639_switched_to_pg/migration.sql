-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('BRAND_NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'FOR_PARTS');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('ELECTRONICS', 'PHONES_TABLETS', 'VEHICLES', 'FURNITURE', 'CLOTHING', 'SPORTS_OUTDOORS', 'HOME_GARDEN', 'BOOKS_EDUCATION', 'FOOD_BEVERAGES', 'SERVICES', 'OTHER');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('PENDING', 'COUNTERED', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "OfferMessageType" AS ENUM ('OFFER', 'COUNTER', 'ACCEPT', 'DECLINE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('OFFER_UPDATE', 'NEW_MESSAGE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "city" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "googleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "webPushSubscription" TEXT,
    "expoPushToken" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "condition" "Condition" NOT NULL,
    "category" "Category" NOT NULL,
    "city" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "sold" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sellerId" TEXT NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "listingId" TEXT NOT NULL,

    CONSTRAINT "ListingImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferThread" (
    "id" TEXT NOT NULL,
    "status" "OfferStatus" NOT NULL DEFAULT 'PENDING',
    "roundCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,

    CONSTRAINT "OfferThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferMessage" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "OfferMessageType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "threadId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,

    CONSTRAINT "OfferMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageThread" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,

    CONSTRAINT "MessageThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "threadId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedListing" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,

    CONSTRAINT "SavedListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "payload" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpRequest" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "magicLinkToken" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "OtpRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reporterId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "listingId" TEXT,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "Listing_sellerId_idx" ON "Listing"("sellerId");

-- CreateIndex
CREATE INDEX "Listing_category_idx" ON "Listing"("category");

-- CreateIndex
CREATE INDEX "Listing_condition_idx" ON "Listing"("condition");

-- CreateIndex
CREATE INDEX "Listing_createdAt_idx" ON "Listing"("createdAt");

-- CreateIndex
CREATE INDEX "Listing_sold_idx" ON "Listing"("sold");

-- CreateIndex
CREATE INDEX "Listing_price_idx" ON "Listing"("price");

-- CreateIndex
CREATE INDEX "ListingImage_listingId_idx" ON "ListingImage"("listingId");

-- CreateIndex
CREATE INDEX "OfferThread_listingId_idx" ON "OfferThread"("listingId");

-- CreateIndex
CREATE INDEX "OfferThread_buyerId_idx" ON "OfferThread"("buyerId");

-- CreateIndex
CREATE INDEX "OfferThread_sellerId_idx" ON "OfferThread"("sellerId");

-- CreateIndex
CREATE INDEX "OfferThread_status_idx" ON "OfferThread"("status");

-- CreateIndex
CREATE INDEX "OfferMessage_threadId_idx" ON "OfferMessage"("threadId");

-- CreateIndex
CREATE INDEX "OfferMessage_senderId_idx" ON "OfferMessage"("senderId");

-- CreateIndex
CREATE INDEX "MessageThread_buyerId_idx" ON "MessageThread"("buyerId");

-- CreateIndex
CREATE INDEX "MessageThread_sellerId_idx" ON "MessageThread"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageThread_listingId_buyerId_key" ON "MessageThread"("listingId", "buyerId");

-- CreateIndex
CREATE INDEX "Message_threadId_idx" ON "Message"("threadId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "SavedListing_userId_idx" ON "SavedListing"("userId");

-- CreateIndex
CREATE INDEX "SavedListing_listingId_idx" ON "SavedListing"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedListing_userId_listingId_key" ON "SavedListing"("userId", "listingId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OtpRequest_magicLinkToken_key" ON "OtpRequest"("magicLinkToken");

-- CreateIndex
CREATE INDEX "OtpRequest_email_idx" ON "OtpRequest"("email");

-- CreateIndex
CREATE INDEX "OtpRequest_createdAt_idx" ON "OtpRequest"("createdAt");

-- CreateIndex
CREATE INDEX "Report_listingId_idx" ON "Report"("listingId");

-- CreateIndex
CREATE INDEX "Report_reporterId_idx" ON "Report"("reporterId");

-- CreateIndex
CREATE INDEX "Review_sellerId_idx" ON "Review"("sellerId");

-- CreateIndex
CREATE INDEX "Review_reviewerId_idx" ON "Review"("reviewerId");

-- CreateIndex
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Review_reviewerId_sellerId_key" ON "Review"("reviewerId", "sellerId");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingImage" ADD CONSTRAINT "ListingImage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferThread" ADD CONSTRAINT "OfferThread_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferThread" ADD CONSTRAINT "OfferThread_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferThread" ADD CONSTRAINT "OfferThread_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferMessage" ADD CONSTRAINT "OfferMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "OfferThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferMessage" ADD CONSTRAINT "OfferMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageThread" ADD CONSTRAINT "MessageThread_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageThread" ADD CONSTRAINT "MessageThread_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageThread" ADD CONSTRAINT "MessageThread_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "MessageThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedListing" ADD CONSTRAINT "SavedListing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedListing" ADD CONSTRAINT "SavedListing_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpRequest" ADD CONSTRAINT "OtpRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
