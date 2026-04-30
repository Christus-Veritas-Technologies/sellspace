"use client";

import { useState, useTransition } from "react";
import {
  Calendar01Icon,
  Home13Icon,
  StarIcon,
  Edit02Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  UserLock01Icon,
  UserSharingIcon,
} from "hugeicons-react";
import { AvatarUpload } from "@/components/avatar-upload";
import { profileApi } from "@/lib/profile-api";

interface Props {
  userId: string;
  displayName: string | null;
  email: string;
  city: string | null;
  avatarUrl: string | null;
  memberYear: number;
  listingCount: number;
  reviewCount: number;
  averageRating: number | null;
  isPrivate: boolean;
  token: string;
}

export function ProfileIdentity(props: Props) {
  const { email, memberYear, listingCount, reviewCount, averageRating, token } = props;

  const [avatarUrl, setAvatarUrl] = useState(props.avatarUrl);
  const [displayName, setDisplayNameState] = useState(props.displayName);
  const [city, setCityState] = useState(props.city);
  const [isPrivate, setIsPrivate] = useState(props.isPrivate);
  const [editOpen, setEditOpen] = useState(false);
  const [nameInput, setNameInput] = useState(props.displayName ?? "");
  const [cityInput, setCityInput] = useState(props.city ?? "");
  const [editError, setEditError] = useState("");
  const [saving, startSave] = useTransition();
  const [privacySaving, startPrivacySave] = useTransition();

  const memberYears = new Date().getFullYear() - memberYear;

  function openEdit() {
    setNameInput(displayName ?? "");
    setCityInput(city ?? "");
    setEditError("");
    setEditOpen(true);
  }

  function saveEdit() {
    if (!nameInput.trim()) { setEditError("Name is required."); return; }
    setEditError("");
    startSave(async () => {
      try {
        const res = (await profileApi.patchMe(token, {
          displayName: nameInput.trim(),
          city: cityInput.trim() || undefined,
        })) as { user: { displayName: string; city: string | null } };
        setDisplayNameState(res.user.displayName);
        setCityState(res.user.city);
        setEditOpen(false);
      } catch (e) {
        setEditError((e as Error).message);
      }
    });
  }

  function togglePrivacy() {
    const next = !isPrivate;
    setIsPrivate(next);
    startPrivacySave(async () => {
      try {
        await profileApi.patchMe(token, { isPrivate: next });
      } catch {
        setIsPrivate(!next); // revert
      }
    });
  }

  return (
    <div className="bg-white rounded-[14px] border border-[#E2E2DC] shadow-[0_1px_3px_rgba(26,26,24,0.06)]">
      {/* Top section */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <AvatarUpload
            displayName={displayName ?? ""}
            currentUrl={avatarUrl}
            onSuccess={(url) => setAvatarUrl(url)}
          />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h1
                  className="text-2xl sm:text-3xl font-[700] text-[#1A1A18] leading-tight"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {displayName ?? "Your Profile"}
                </h1>
                <p className="text-[13px] sm:text-[14px] text-[#4A4A45] mt-1 break-all">{email}</p>
              </div>
              <button
                onClick={openEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#EFEFEB] text-[#1A1A18] text-[13px] font-[600] hover:bg-[#E2E2DC] transition-colors shrink-0"
              >
                <Edit02Icon size={14} />
                Edit
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
              {city && (
                <span className="flex items-center gap-1 text-[13px] text-[#8A8A82]">
                  <Home13Icon size={13} />
                  {city}
                </span>
              )}
              <span className="flex items-center gap-1 text-[13px] text-[#8A8A82]">
                <Calendar01Icon size={13} />
                Member for {memberYears} {memberYears === 1 ? "year" : "years"}
              </span>
            </div>

            <button
              onClick={togglePrivacy}
              disabled={privacySaving}
              className={`mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-[600] transition-colors border disabled:opacity-60
                ${isPrivate
                  ? "bg-[#FEF3C7] text-[#D97706] border-transparent hover:bg-[#FDE68A]"
                  : "bg-[#DCFCE7] text-[#16A34A] border-transparent hover:bg-[#BBF7D0]"
                }`}
            >
              {isPrivate ? (
                <><UserLock01Icon size={13} /> Private profile</>
              ) : (
                <><UserSharingIcon size={13} /> Public profile</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-[#E2E2DC] border-t border-[#E2E2DC]">
        <div className="py-4 text-center">
          <div className="text-2xl sm:text-3xl font-[700] text-[#1A1A18]" style={{ fontFamily: "'Fraunces', serif" }}>
            {listingCount}
          </div>
          <p className="text-[11px] sm:text-[12px] text-[#8A8A82] mt-0.5">
            {listingCount === 1 ? "Active Listing" : "Active Listings"}
          </p>
        </div>

        <div className="py-4 text-center">
          {reviewCount > 0 ? (
            <>
              <div className="flex items-center justify-center gap-1">
                <span className="text-2xl sm:text-3xl font-[700] text-[#1A1A18]" style={{ fontFamily: "'Fraunces', serif" }}>
                  {averageRating?.toFixed(1) ?? "—"}
                </span>
                <StarIcon size={18} color="#F4A61D" fill="#F4A61D" />
              </div>
              <p className="text-[11px] sm:text-[12px] text-[#8A8A82] mt-0.5">
                {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
              </p>
            </>
          ) : (
            <>
              <div className="text-2xl sm:text-3xl font-[700] text-[#8A8A82]" style={{ fontFamily: "'Fraunces', serif" }}>—</div>
              <p className="text-[11px] sm:text-[12px] text-[#8A8A82] mt-0.5">No reviews yet</p>
            </>
          )}
        </div>

        <div className="py-4 text-center">
          <div className="text-2xl sm:text-3xl font-[700] text-[#0D3B2E]" style={{ fontFamily: "'Fraunces', serif" }}>
            100%
          </div>
          <p className="text-[11px] sm:text-[12px] text-[#8A8A82] mt-0.5">Verified</p>
        </div>
      </div>

      {/* Edit modal */}
      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4 sm:pb-0"
          onClick={(e) => { if (e.target === e.currentTarget) setEditOpen(false); }}
        >
          <div className="w-full max-w-md bg-white rounded-[14px] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-[700] text-[#1A1A18]" style={{ fontFamily: "'Fraunces', serif" }}>
                Edit Profile
              </h2>
              <button onClick={() => setEditOpen(false)} className="p-1 rounded-full hover:bg-[#EFEFEB]" aria-label="Close">
                <Cancel01Icon size={18} color="#8A8A82" />
              </button>
            </div>

            <div>
              <label className="block text-[12px] font-[600] text-[#4A4A45] mb-1.5">Display name</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E2E2DC] bg-[#FAFAF8] text-[14px] text-[#1A1A18] focus:outline-none focus:border-[#0D3B2E] transition-colors"
                placeholder="Your name"
                maxLength={80}
              />
            </div>

            <div>
              <label className="block text-[12px] font-[600] text-[#4A4A45] mb-1.5">City</label>
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E2E2DC] bg-[#FAFAF8] text-[14px] text-[#1A1A18] focus:outline-none focus:border-[#0D3B2E] transition-colors"
                placeholder="e.g. Harare"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-[12px] font-[600] text-[#4A4A45] mb-1.5">Email</label>
              <div className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E2E2DC] bg-[#F2F2EF] text-[14px] text-[#8A8A82] cursor-not-allowed">
                {email}
              </div>
              <p className="text-[11px] text-[#8A8A82] mt-1">Email cannot be changed.</p>
            </div>

            {editError && <p className="text-[13px] text-[#DC2626]">{editError}</p>}

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setEditOpen(false)}
                className="flex-1 py-2.5 rounded-[10px] border border-[#E2E2DC] text-[14px] font-[600] text-[#1A1A18] hover:bg-[#EFEFEB] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex-1 py-2.5 rounded-[10px] bg-[#0D3B2E] text-[14px] font-[600] text-[#FAFAF8] hover:bg-[#0A2E24] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckmarkCircle02Icon size={16} color="#FAFAF8" />
                )}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

