---
name: sellspace-design-system
description: >
  Full design system for Sellspace — a Zimbabwean peer-to-peer marketplace.
  Apply this skill whenever building any UI component, screen, or page for the
  Sellspace monorepo (apps/web with shadcn, apps/mobile with react-native-reusables).
  Covers color tokens, typography, spacing, component patterns, icons (HugeIcons),
  and auth (Email OTP via Nodemailer). Do NOT deviate from these tokens or patterns
  without explicit instruction.
applies_to:
  - apps/web/**
  - apps/mobile/**
  - packages/ui/**
---

# Sellspace Design System

## 0. Guiding Aesthetic

Sellspace is a **clean, commerce-forward marketplace**. The visual language is:

- **Light, airy surfaces** — white cards on warm-gray backgrounds. Never dark by default.
- **Grid-dense but breathable** — products in tight grids with generous internal card padding.
- **Accent-led hierarchy** — one strong copper-orange accent pulls all CTAs and prices.
- **Editorial section headers** — each content section has a clear label + filter pills + navigation arrows.
- **Badge-first condition system** — condition/deal badges are always visible overlaid on images.
- **No decorative gradients, no glassmorphism, no purple.** Clean. Purposeful. Market-stall energy, digitised.

---

## 1. Color Tokens

### Brand Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#0D3B2E` | Nav background, headings, primary buttons |
| `--color-primary-hover` | `#0A2E24` | Primary button hover |
| `--color-primary-foreground` | `#FAFAF8` | Text on primary bg |
| `--color-accent` | `#E8621A` | CTAs, price highlights, active states, links |
| `--color-accent-hover` | `#C9521A` | Accent hover |
| `--color-accent-foreground` | `#FFFFFF` | Text on accent bg |
| `--color-amber` | `#F4A61D` | Sale badges, Save% chips, offer indicators |
| `--color-amber-foreground` | `#1A1A18` | Text on amber bg |

### Surface Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-background` | `#F2F2EF` | Page background (warm gray) |
| `--color-surface` | `#FAFAF8` | Cards, panels, modals |
| `--color-surface-2` | `#EFEFEB` | Input backgrounds, hover states, tag chips |
| `--color-border` | `#E2E2DC` | Card borders, dividers, input borders |
| `--color-border-strong` | `#C8C8C0` | Focused inputs, active filters |

### Text Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-text` | `#1A1A18` | Primary body text |
| `--color-text-secondary` | `#4A4A45` | Labels, metadata |
| `--color-text-muted` | `#8A8A82` | Placeholders, timestamps, unit labels |
| `--color-text-disabled` | `#B8B8B0` | Disabled states |

### Semantic Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | `#16A34A` | Deal closed, verified badges |
| `--color-success-bg` | `#DCFCE7` | Success toast/alert backgrounds |
| `--color-warning` | `#D97706` | Pending offers, expiry warnings |
| `--color-warning-bg` | `#FEF3C7` | Warning backgrounds |
| `--color-destructive` | `#DC2626` | Errors, remove actions |
| `--color-destructive-bg` | `#FEE2E2` | Error backgrounds |

### shadcn CSS Variables (apps/web — globals.css)

```css
:root {
  --background: 60 10% 94%;           /* #F2F2EF */
  --foreground: 60 5% 10%;            /* #1A1A18 */
  --card: 60 10% 98%;                 /* #FAFAF8 */
  --card-foreground: 60 5% 10%;
  --popover: 60 10% 98%;
  --popover-foreground: 60 5% 10%;
  --primary: 158 63% 14%;             /* #0D3B2E */
  --primary-foreground: 60 10% 98%;
  --secondary: 60 8% 93%;             /* #EFEFEB */
  --secondary-foreground: 60 5% 10%;
  --muted: 60 8% 93%;
  --muted-foreground: 60 3% 55%;      /* #8A8A82 */
  --accent: 22 80% 51%;               /* #E8621A */
  --accent-foreground: 0 0% 100%;
  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 100%;
  --border: 60 8% 88%;                /* #E2E2DC */
  --input: 60 8% 88%;
  --ring: 22 80% 51%;                 /* focus ring = accent */
  --radius: 0.625rem;                 /* 10px — base border radius */

  /* Sellspace custom tokens */
  --ss-amber: #F4A61D;
  --ss-amber-fg: #1A1A18;
  --ss-surface-2: #EFEFEB;
  --ss-border-strong: #C8C8C0;
  --ss-success: #16A34A;
  --ss-success-bg: #DCFCE7;
}
```

### React Native Reusables Tokens (packages/ui/theme.ts)

```ts
export const colors = {
  primary: '#0D3B2E',
  primaryHover: '#0A2E24',
  primaryForeground: '#FAFAF8',
  accent: '#E8621A',
  accentHover: '#C9521A',
  accentForeground: '#FFFFFF',
  amber: '#F4A61D',
  amberForeground: '#1A1A18',
  background: '#F2F2EF',
  surface: '#FAFAF8',
  surface2: '#EFEFEB',
  border: '#E2E2DC',
  borderStrong: '#C8C8C0',
  text: '#1A1A18',
  textSecondary: '#4A4A45',
  textMuted: '#8A8A82',
  textDisabled: '#B8B8B0',
  success: '#16A34A',
  successBg: '#DCFCE7',
  warning: '#D97706',
  warningBg: '#FEF3C7',
  destructive: '#DC2626',
  destructiveBg: '#FEE2E2',
  white: '#FFFFFF',
} as const;
```

---

## 2. Typography

### Font Families

| Role | Font | Install |
|------|------|---------|
| Display / Headings | **Fraunces** (serif, variable) | `@fontsource/fraunces` |
| Body / UI | **DM Sans** (sans-serif, variable) | `@fontsource-variable/dm-sans` |

```css
/* apps/web/globals.css */
@import '@fontsource/fraunces/400.css';
@import '@fontsource/fraunces/600.css';
@import '@fontsource/fraunces/700.css';
@import '@fontsource-variable/dm-sans';

:root {
  --font-display: 'Fraunces', Georgia, serif;
  --font-body: 'DM Sans Variable', system-ui, sans-serif;
}

body {
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text);
}
```

```ts
// apps/mobile — use expo-font
// Load: Fraunces_400Regular, Fraunces_600SemiBold, Fraunces_700Bold
// Load: DMSans_400Regular, DMSans_500Medium, DMSans_700Bold
```

### Type Scale

| Token | Size | Weight | Line Height | Font | Usage |
|-------|------|--------|-------------|------|-------|
| `display-xl` | 36px / 2.25rem | 700 | 1.1 | Fraunces | Hero headlines |
| `display-lg` | 28px / 1.75rem | 700 | 1.15 | Fraunces | Page titles |
| `display-md` | 22px / 1.375rem | 600 | 1.2 | Fraunces | Section headers |
| `title-lg` | 18px / 1.125rem | 600 | 1.3 | DM Sans | Card titles, modal headers |
| `title-md` | 16px / 1rem | 600 | 1.35 | DM Sans | List headers, form labels |
| `body-lg` | 15px / 0.9375rem | 400 | 1.5 | DM Sans | Primary body text |
| `body-md` | 14px / 0.875rem | 400 | 1.5 | DM Sans | Default body, descriptions |
| `body-sm` | 13px / 0.8125rem | 400 | 1.45 | DM Sans | Metadata, unit labels |
| `caption` | 12px / 0.75rem | 400 | 1.4 | DM Sans | Timestamps, helper text |
| `label` | 12px / 0.75rem | 600 | 1.3 | DM Sans | Badge text, chip labels |
| `price-lg` | 20px / 1.25rem | 700 | 1.2 | DM Sans | Listing price (accent color) |
| `price-md` | 16px / 1rem | 700 | 1.2 | DM Sans | Card price |
| `price-strike` | 13px / 0.8125rem | 400 | 1.4 | DM Sans | Original price, strikethrough |

---

## 3. Spacing System

Base unit: **4px**. Use multiples exclusively.

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Micro gaps (icon↔label) |
| `space-2` | 8px | Tight internal padding |
| `space-3` | 12px | Badge padding, chip padding |
| `space-4` | 16px | Card internal padding (standard) |
| `space-5` | 20px | Card internal padding (comfortable) |
| `space-6` | 24px | Section gap, between cards |
| `space-8` | 32px | Section vertical margins |
| `space-10` | 40px | Large section spacing |
| `space-12` | 48px | Page-level top/bottom padding |
| `space-16` | 64px | Hero sections |

### Padding Rules

| Context | Padding |
|---------|---------|
| Product card (web) | `16px` all sides |
| Product card (mobile) | `12px` all sides |
| Page horizontal gutter (web) | `24px` (md: `40px`, xl: `80px`) |
| Page horizontal gutter (mobile) | `16px` |
| Section header row | `0 0 16px 0` |
| Filter pill | `6px 14px` |
| Button (md) | `10px 20px` |
| Button (sm) | `6px 14px` |
| Input | `10px 14px` |
| Badge/chip | `4px 8px` |
| Modal/Sheet | `24px` |
| Bottom tab bar (mobile) | `12px top, safe-area bottom` |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 6px | Badges, chips, small buttons |
| `radius-md` | 10px | Cards, inputs, standard buttons |
| `radius-lg` | 14px | Modals, bottom sheets, larger cards |
| `radius-xl` | 20px | Full-width hero cards |
| `radius-full` | 9999px | Pill buttons, avatar, rounded tags |

---

## 4. Elevation / Shadow

```css
/* Web */
--shadow-card: 0 1px 3px rgba(26,26,24,0.06), 0 1px 2px rgba(26,26,24,0.04);
--shadow-card-hover: 0 4px 12px rgba(26,26,24,0.10), 0 2px 4px rgba(26,26,24,0.06);
--shadow-modal: 0 20px 60px rgba(26,26,24,0.18);
--shadow-dropdown: 0 4px 16px rgba(26,26,24,0.12);
--shadow-fab: 0 4px 14px rgba(232,98,26,0.35);  /* accent colored */
```

```ts
// React Native
export const shadows = {
  card: {
    shadowColor: '#1A1A18',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  modal: {
    shadowColor: '#1A1A18',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  fab: {
    shadowColor: '#E8621A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
};
```

---

## 5. Icons — HugeIcons

All icons must come from `hugeicons-react` (web) and `@hugeicons/react-native` (mobile). Do NOT mix in lucide-react, heroicons, or any other icon library.

```bash
# Web
pnpm add hugeicons-react --filter=web

# Mobile
pnpm add @hugeicons/react-native --filter=mobile
```

### Standard Icon Sizes

| Context | Size |
|---------|------|
| Navigation bar icon | 24px |
| Tab bar icon (mobile) | 22px |
| Card action icon | 20px |
| Inline / label icon | 16px |
| Badge / chip icon | 14px |

### Canonical Icon Map

| Action / Concept | HugeIcon Name |
|-----------------|---------------|
| Search | `Search01Icon` |
| Menu / Hamburger | `Menu01Icon` |
| Close | `Cancel01Icon` |
| Back | `ArrowLeft01Icon` |
| Bookmark / Save | `BookmarkIcon` |
| Bookmark filled | `BookmarkAdd01Icon` |
| Message / Chat | `MessageIcon` |
| Notification | `Notification01Icon` |
| User / Profile | `UserIcon` |
| Listing / Post | `Add01Icon` |
| Filter | `FilterIcon` |
| Sort | `ArrowUpDown01Icon` |
| Camera / Photo | `Camera01Icon` |
| Location | `Location01Icon` |
| Phone | `Call01Icon` |
| Email | `Mail01Icon` |
| Edit | `PencilEdit01Icon` |
| Delete | `Delete01Icon` |
| Share | `Share01Icon` |
| Offer / Haggle | `ExchangeIcon` |
| Handshake / Deal | `HandShakeIcon` |
| Star (rating) | `StarIcon` |
| Star filled | `FavouriteIcon` |
| Tag / Price | `Tag01Icon` |
| Category | `GridIcon` |
| Settings | `Settings01Icon` |
| Logout | `Logout01Icon` |
| Check / Done | `CheckmarkCircle01Icon` |
| Alert | `Alert01Icon` |
| Image | `Image01Icon` |
| More options | `MoreHorizontalIcon` |
| Condition badge | `ShieldCheckIcon` |
| Report / Flag | `Flag01Icon` |
| Eye / View | `ViewIcon` |
| New / Sparkle | `SparklesIcon` |

### Usage Pattern

```tsx
// Web
import { BookmarkIcon, ExchangeIcon } from 'hugeicons-react';
<BookmarkIcon size={20} color={colors.accent} strokeWidth={1.5} />

// Mobile
import { BookmarkIcon } from '@hugeicons/react-native';
<BookmarkIcon size={20} color={colors.accent} variant="stroke" />
```

---

## 6. Component Patterns

### 6.1 Product / Listing Card

The primary unit of the marketplace. Used in grid and list views.

**Anatomy:**
```
┌──────────────────────────────┐
│  [PHOTO]           [BADGE]   │  ← image area, 56% height; badge top-right
│                   [BOOKMARK] │  ← bookmark icon, top-right
├──────────────────────────────┤
│  Category chip               │  ← 12px label, muted text
│  Title (2 lines max, clip)   │  ← title-md, DM Sans 600
│  Seller name · Location      │  ← body-sm, muted
│  ★★★★☆  (4.2)  · 12 reviews │  ← 12px stars + count
│  $120    ~~$150~~            │  ← price-md accent + strike muted
└──────────────────────────────┘
```

**Web — shadcn Card extension:**
```tsx
// packages/ui/listing-card.tsx (web)
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookmarkIcon } from 'hugeicons-react';
import { cn } from '@/lib/utils';

interface ListingCardProps {
  image: string;
  condition: 'BRAND_NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'FOR_PARTS';
  category: string;
  title: string;
  sellerName: string;
  city: string;
  rating?: number;
  reviewCount?: number;
  price: number;
  originalPrice?: number;
  saved?: boolean;
  onSave?: () => void;
  currency?: string;
}

const conditionConfig = {
  BRAND_NEW:  { label: 'Brand New',  className: 'bg-[#0D3B2E] text-white' },
  LIKE_NEW:   { label: 'Like New',   className: 'bg-[#E8621A] text-white' },
  GOOD:       { label: 'Good',       className: 'bg-[#F4A61D] text-[#1A1A18]' },
  FAIR:       { label: 'Fair',       className: 'bg-[#EFEFEB] text-[#4A4A45]' },
  FOR_PARTS:  { label: 'For Parts',  className: 'bg-[#FEE2E2] text-[#DC2626]' },
};

export function ListingCard({
  image, condition, category, title, sellerName,
  city, rating, reviewCount, price, originalPrice,
  saved, onSave, currency = 'USD',
}: ListingCardProps) {
  const cond = conditionConfig[condition];
  return (
    <Card className="group relative overflow-hidden border border-[--border] bg-[--card]
                     shadow-[--shadow-card] hover:shadow-[--shadow-card-hover]
                     transition-shadow duration-200 rounded-[10px]">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[--ss-surface-2]">
        <img src={image} alt={title}
             className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" />
        {/* Condition badge */}
        <span className={cn('absolute top-2 left-2 text-[11px] font-[600] px-2 py-1 rounded-[6px]', cond.className)}>
          {cond.label}
        </span>
        {/* Bookmark */}
        <button onClick={onSave}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80
                           backdrop-blur-sm flex items-center justify-center
                           hover:bg-white transition-colors">
          <BookmarkIcon size={16}
                        color={saved ? '#E8621A' : '#8A8A82'}
                        fill={saved ? '#E8621A' : 'none'} />
        </button>
      </div>
      {/* Content */}
      <CardContent className="p-4 space-y-1.5">
        <p className="text-[11px] font-[600] uppercase tracking-wide text-[--muted-foreground]">
          {category}
        </p>
        <h3 className="text-[14px] font-[600] leading-[1.35] line-clamp-2 text-[--foreground]">
          {title}
        </h3>
        <p className="text-[12px] text-[--muted-foreground]">
          {sellerName} · {city}
        </p>
        {rating !== undefined && (
          <div className="flex items-center gap-1">
            <StarRow rating={rating} size={12} />
            <span className="text-[12px] text-[--muted-foreground]">({reviewCount ?? 0})</span>
          </div>
        )}
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-[16px] font-[700] text-[#E8621A]">
            ${price.toFixed(2)}
          </span>
          {originalPrice && (
            <span className="text-[13px] text-[--muted-foreground] line-through">
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

**Mobile — React Native Reusables:**
```tsx
import { View, Text, Image, Pressable } from 'react-native';
import { Card } from '@/components/ui/card';  // rn-reusables
import { BookmarkIcon } from '@hugeicons/react-native';
import { colors, shadows } from '@/theme';

// Same anatomy, use StyleSheet. Image aspect ratio 4:3.
// Condition badge: absolute top-left with borderRadius: 6
// Price row: flexDirection row, alignItems baseline
// Pressable wraps entire card, onPress → listing detail
// Bookmark Pressable is hitSlop={{ top:8, right:8, bottom:8, left:8 }}
```

---

### 6.2 Section Header Row

Repeating pattern for every content section (Best Sellers, Just Listed, Browse by Category).

```
Best Sellers    [All] [Electronics] [Phones]    < >
```

**Web:**
```tsx
function SectionHeader({ title, filters, onFilter, activeFilter, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-6 flex-wrap">
        <h2 className="font-display text-[22px] font-[600] text-[--foreground]">{title}</h2>
        <div className="flex items-center gap-1.5">
          {filters.map(f => (
            <button key={f}
              onClick={() => onFilter(f)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-[13px] font-[500] transition-colors',
                activeFilter === f
                  ? 'bg-[#E8621A] text-white'
                  : 'text-[#4A4A45] hover:bg-[#EFEFEB]'
              )}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-1">
        {[onPrev, onNext].map((fn, i) => (
          <button key={i} onClick={fn}
                  className="w-8 h-8 rounded-full border border-[--border]
                             flex items-center justify-center hover:bg-[--secondary]">
            {i === 0
              ? <ArrowLeft01Icon size={16} color="#4A4A45" />
              : <ArrowRight01Icon size={16} color="#4A4A45" />}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

### 6.3 Condition Badge / Chip

Used on cards (overlay) and on listing detail pages (inline).

| Condition | Background | Text | Border |
|-----------|-----------|------|--------|
| Brand New | `#0D3B2E` | `#FAFAF8` | none |
| Like New | `#E8621A` | `#FFFFFF` | none |
| Good | `#F4A61D` | `#1A1A18` | none |
| Fair | `#EFEFEB` | `#4A4A45` | `#C8C8C0` |
| For Parts | `#FEE2E2` | `#DC2626` | none |

---

### 6.4 Filter Pills (Browse Page)

Horizontal scrollable row of pill buttons.

```tsx
// Scrollable on mobile (FlatList horizontal), flex-wrap on web
// Active: bg-[#0D3B2E] text-white
// Inactive: bg-[#EFEFEB] text-[#4A4A45] border border-[--border]
// Height: 34px, padding: 6px 16px, borderRadius: 9999px
// Gap between pills: 8px
```

---

### 6.5 Offer / Haggle UI

The haggle thread is a specialized chat-like UI.

```
Offer Thread ──────────────────────────────
  You offered $80              [PENDING →]
  ─────────────────────────────
  Seller countered $95         [COUNTER ↩]
  ─────────────────────────────
  ┌─────────────────────────────────────┐
  │  Your counter offer:  [$____]       │
  │  [Accept $95]  [Counter]  [Decline] │
  └─────────────────────────────────────┘
```

- Each round is a chat bubble, right-aligned (yours), left-aligned (theirs)
- Amount is bold, accent colored
- Action buttons: Accept = primary green, Counter = accent orange, Decline = outlined destructive
- Max rounds indicator: "Round 3 of 10" — caption, muted

---

### 6.6 Listing Detail Page Layout

```
[Back arrow]  [Share]  [Report]

[Photo gallery — full width, 16:9, swipeable]
  ● ● ○ ○ ○   (dots)

[CONDITION BADGE]  [CATEGORY CHIP]
[Title — display-lg, Fraunces]
[Seller row: avatar · name · city · rating]
[Price — price-lg, accent]

[Make an Offer]  [Message Seller]  ← sticky bottom bar
────────────────────────────────
Description
────────────────────────────────
Details table (Condition, Category, Listed date, Views)
────────────────────────────────
More from this seller (horizontal scroll cards)
```

---

### 6.7 Category Browser Grid

```
[Icon card]  [Icon card]  [Icon card]  [Icon card]
Electronics  Phones       Vehicles     Furniture
```

- Web: 4–6 columns, `aspect-square` cards, icon centered, label below
- Mobile: 4 columns, compact
- Active/selected category: `border-2 border-[#E8621A]` ring
- Card size (web): 100px × auto, icon 32px, label 12px

---

### 6.8 Navigation

**Web (Next.js app/layout):**
```
┌── Top bar (bg-[#0D3B2E]) ────────────────────────────────────┐
│  [Logo: Sellspace] │ [Search bar — full] │ [Saved] [Inbox] [Profile] │
└──────────────────────────────────────────────────────────────┘
┌── Sub nav (bg-white, border-bottom) ──────────────────────────┐
│  [Browse ▾] Deals Today  Electronics  Vehicles  Furniture ...  │
└──────────────────────────────────────────────────────────────┘
```

- Top bar height: 64px
- Sub nav height: 44px
- Logo: Fraunces 700, `sell` in `#FAFAF8`, `space` in `#E8621A`

**Mobile (Expo Tabs):**
```
Bottom Tab Bar (5 tabs):
  Home | Browse | [+ Sell FAB] | Inbox | Profile
```
- FAB (center): 56px circle, bg `#E8621A`, shadow-fab, `Add01Icon` white 24px
- Tab icon: 22px, inactive `#8A8A82`, active `#E8621A`
- Tab label: 10px DM Sans, active `#E8621A`
- Bar background: `#FAFAF8`, top border `#E2E2DC`

---

### 6.9 Search Bar

```tsx
// Web — extends shadcn Input
<div className="relative flex-1 max-w-[600px]">
  <Search01Icon size={16} color="#8A8A82"
    className="absolute left-3 top-1/2 -translate-y-1/2" />
  <Input
    className="pl-9 pr-4 py-2.5 rounded-full border-[--border]
               bg-white text-[14px] placeholder:text-[--muted-foreground]
               focus-visible:ring-1 focus-visible:ring-[#E8621A]"
    placeholder="Search listings..." />
</div>

// Mobile — same pattern, use rn-reusables Input
// Wrapped in View with borderRadius: 9999, backgroundColor: colors.surface
```

---

### 6.10 Buttons

Built on top of shadcn `Button` / rn-reusables `Button`. Only these variants are used:

| Variant | Background | Text | Border | Usage |
|---------|-----------|------|--------|-------|
| `primary` | `#0D3B2E` | `#FAFAF8` | — | Account actions, Mark as Sold |
| `accent` | `#E8621A` | `#FFFFFF` | — | Make an Offer, Add Listing, CTAs |
| `outline` | transparent | `#1A1A18` | `#E2E2DC` | Secondary actions |
| `ghost` | transparent | `#4A4A45` | — | Tertiary, icon buttons |
| `destructive` | `#DC2626` | `#FFFFFF` | — | Delete, Remove |
| `amber` | `#F4A61D` | `#1A1A18` | — | Counter offer, Save badges |

Height: sm=32px, md=40px, lg=48px. Border radius: 10px (default), 9999px (pill variant).

---

## 7. Page Grid Layout

### Web

```css
.ss-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 40px;       /* xl */
}

/* Listing grid */
.ss-grid-listings {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

/* Category grid */
.ss-grid-categories {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

/* Sidebar + content (browse page) */
.ss-layout-browse {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 24px;
}
```

### Mobile

```ts
// Standard safe screen
<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
  <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
    ...
  </ScrollView>
</SafeAreaView>

// Listing grid
<FlatList numColumns={2} columnWrapperStyle={{ gap: 12 }} contentContainerStyle={{ gap: 12 }} />
```

---

## 8. Auth — Email OTP via Nodemailer

Authentication is email-based OTP. No SMS, no third-party auth services.

### Flow
1. User enters email → POST `/auth/request-otp`
2. Server generates 6-digit OTP, stores hash + expiry (10 min) in DB
3. Nodemailer sends branded email
4. User enters OTP → POST `/auth/verify-otp`
5. Server returns `accessToken` (15min) + `refreshToken` (30d)

### API Implementation (apps/api — Hono)

```ts
// packages/db — add to Prisma schema
model OtpRequest {
  id        String   @id @default(cuid())
  email     String
  otpHash   String   // bcrypt hash of 6-digit code
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([email])
}
```

```ts
// apps/api/src/lib/mailer.ts
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,       // e.g. smtp.gmail.com or Brevo/Mailersend
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOtpEmail(to: string, otp: string) {
  await transporter.sendMail({
    from: `"Sellspace" <noreply@sellspace.co.zw>`,
    to,
    subject: `Your Sellspace code: ${otp}`,
    html: otpEmailTemplate(otp),
  });
}
```

```ts
// apps/api/src/lib/otp-template.ts
export function otpEmailTemplate(otp: string): string {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { margin: 0; background: #F2F2EF; font-family: 'DM Sans', Arial, sans-serif; }
      .container { max-width: 480px; margin: 40px auto; background: #FAFAF8;
                   border-radius: 14px; overflow: hidden; border: 1px solid #E2E2DC; }
      .header { background: #0D3B2E; padding: 28px 32px; }
      .logo { font-size: 22px; font-weight: 700; color: #FAFAF8; letter-spacing: -0.5px; }
      .logo span { color: #E8621A; }
      .body { padding: 32px; }
      .otp { font-size: 40px; font-weight: 700; letter-spacing: 8px; color: #E8621A;
             text-align: center; margin: 24px 0; padding: 16px; background: #EFEFEB;
             border-radius: 10px; }
      .note { font-size: 13px; color: #8A8A82; text-align: center; margin-top: 16px; }
      .footer { padding: 16px 32px; border-top: 1px solid #E2E2DC;
                font-size: 12px; color: #8A8A82; text-align: center; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">sell<span>space</span></div>
      </div>
      <div class="body">
        <p style="font-size:16px; font-weight:600; color:#1A1A18;">Your sign-in code</p>
        <p style="font-size:14px; color:#4A4A45;">
          Use the code below to sign in to your Sellspace account.
          It expires in <strong>10 minutes</strong>.
        </p>
        <div class="otp">${otp}</div>
        <p class="note">If you didn't request this, ignore this email.</p>
      </div>
      <div class="footer">sellspace.co.zw · Zimbabwe's marketplace</div>
    </div>
  </body>
  </html>`;
}
```

```ts
// apps/api/src/routes/auth.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { generateOtp } from '../lib/crypto';
import { sendOtpEmail } from '../lib/mailer';
import { signAccessToken, signRefreshToken } from '../lib/jwt';
import { db } from '../lib/db';

const auth = new Hono();

auth.post('/request-otp',
  zValidator('json', z.object({ email: z.string().email() })),
  async (c) => {
    const { email } = c.req.valid('json');

    // Rate limit: max 3 OTPs per email per 10 min (check DB count)
    const recentCount = await db.otpRequest.count({
      where: { email, createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) } },
    });
    if (recentCount >= 3) {
      return c.json({ error: 'Too many requests. Try again later.' }, 429);
    }

    const otp = generateOtp();                          // 6-digit string
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.otpRequest.create({ data: { email, otpHash, expiresAt } });
    await sendOtpEmail(email, otp);

    return c.json({ message: 'OTP sent' });
  }
);

auth.post('/verify-otp',
  zValidator('json', z.object({ email: z.string().email(), otp: z.string().length(6) })),
  async (c) => {
    const { email, otp } = c.req.valid('json');

    const record = await db.otpRequest.findFirst({
      where: { email, used: false, expiresAt: { gte: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!record || !(await bcrypt.compare(otp, record.otpHash))) {
      return c.json({ error: 'Invalid or expired OTP' }, 401);
    }

    await db.otpRequest.update({ where: { id: record.id }, data: { used: true } });

    // Upsert user
    const user = await db.user.upsert({
      where: { email },
      create: { email, displayName: email.split('@')[0] },
      update: {},
    });

    const accessToken  = signAccessToken({ sub: user.id });
    const refreshToken = signRefreshToken({ sub: user.id });

    return c.json({ accessToken, refreshToken, user });
  }
);

export default auth;
```

### SMTP Options (env vars)

```env
# Free options (pick one):

# Option A: Gmail (up to 500/day via app password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=app-password-here

# Option B: Brevo (formerly Sendinblue) — 300/day free
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=brevo-api-key

# Option C: Mailersend — 3000/month free
SMTP_HOST=smtp.mailersend.net
SMTP_PORT=587
SMTP_USER=MS_xxxx@yourdomain.com
SMTP_PASS=mailersend-api-key
```

---

## 9. OTP Screen (UI Pattern)

```
┌─────────────────────────────┐
│         sellspace            │   ← logo, Fraunces, centered
│                              │
│   Sign in to your account   │   ← display-md
│   We'll send a code to your │   ← body-md, muted
│   email address             │
│                              │
│   [Email input]             │   ← full width, rounded-md
│   [Continue]                │   ← accent button, full width
│                              │
│   ─── or sign up ───        │   ← caption, muted
└─────────────────────────────┘

After submit → OTP entry screen:
┌─────────────────────────────┐
│   Check your email          │   ← display-md
│   Sent to hello@example.com │   ← body-sm, muted
│                              │
│   [_] [_] [_] [_] [_] [_]  │   ← 6 separate OTP boxes
│                              │
│   [Verify Code]             │   ← primary button
│   Resend code (0:45)        │   ← caption, countdown, tappable after 0
└─────────────────────────────┘
```

OTP input boxes: 48×56px each, border `#E2E2DC`, active border `#E8621A`, borderRadius 10px, font-size 24px bold, text-align center, auto-advance on digit entry.

---

## 10. File Structure for UI Package

```
packages/ui/
├── theme.ts              # colors, shadows, spacing constants
├── typography.ts         # font scale constants
├── components/
│   ├── listing-card.tsx  # web + native exports
│   ├── condition-badge.tsx
│   ├── section-header.tsx
│   ├── category-tile.tsx
│   ├── offer-bubble.tsx
│   ├── star-row.tsx
│   ├── filter-pill.tsx
│   └── otp-input.tsx
└── index.ts              # barrel export
```

---

## 11. Do's and Don'ts

| ✅ Do | ❌ Don't |
|-------|---------|
| Use Fraunces for all headings | Use Inter, Roboto, or system fonts |
| Use HugeIcons exclusively | Mix in lucide, heroicons, phosphor |
| White cards on `#F2F2EF` background | Dark mode by default |
| Condition badges always visible on card | Hide condition in collapsed accordion |
| `#E8621A` for prices, CTAs, active states | Use multiple competing accent colors |
| 16px card padding (web), 12px (mobile) | Use inconsistent or tight padding |
| 10px border radius as base | Use 4px (too sharp) or 24px (too bubbly) |
| `bcrypt` OTP hashing | Store OTP in plaintext |
| Rate-limit OTP requests (3/10min) | Allow unlimited OTP requests |
| `nodemailer` for all transactional email | Integrate paid SMS at MVP |
| Horizontal filter pills per section | Full-page modal for every filter |