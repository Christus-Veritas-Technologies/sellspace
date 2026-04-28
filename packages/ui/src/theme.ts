/**
 * Sellspace design tokens — consumed by apps/native and any RN components.
 * All values are sourced from the Sellspace design system SKILL.md.
 * Do NOT deviate from these tokens.
 */

// ─── Colors ──────────────────────────────────────────────────────────────────

export const colors = {
  // Brand
  primary: '#0D3B2E',
  primaryHover: '#0A2E24',
  primaryForeground: '#FAFAF8',
  accent: '#E8621A',
  accentHover: '#C9521A',
  accentForeground: '#FFFFFF',
  amber: '#F4A61D',
  amberForeground: '#1A1A18',

  // Surface
  background: '#F2F2EF',
  surface: '#FAFAF8',
  surface2: '#EFEFEB',
  border: '#E2E2DC',
  borderStrong: '#C8C8C0',

  // Text
  text: '#1A1A18',
  textSecondary: '#4A4A45',
  textMuted: '#8A8A82',
  textDisabled: '#B8B8B0',

  // Semantic
  success: '#16A34A',
  successBg: '#DCFCE7',
  warning: '#D97706',
  warningBg: '#FEF3C7',
  destructive: '#DC2626',
  destructiveBg: '#FEE2E2',

  white: '#FFFFFF',
} as const;

export type ColorKey = keyof typeof colors;

// ─── Shadows (React Native) ───────────────────────────────────────────────────

export const shadows = {
  card: {
    shadowColor: '#1A1A18',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHover: {
    shadowColor: '#1A1A18',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  modal: {
    shadowColor: '#1A1A18',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  dropdown: {
    shadowColor: '#1A1A18',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  fab: {
    shadowColor: '#E8621A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
} as const;

// ─── Spacing (4px base unit) ──────────────────────────────────────────────────

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export type SpacingKey = keyof typeof spacing;

// ─── Border Radii ─────────────────────────────────────────────────────────────

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

export type RadiusKey = keyof typeof radii;

// ─── Typography ───────────────────────────────────────────────────────────────

export const fontFamilies = {
  display: 'Fraunces',
  body: 'DMSans',
} as const;

export const typography = {
  'display-xl': { fontSize: 36, fontWeight: '700' as const, lineHeight: 40, fontFamily: fontFamilies.display },
  'display-lg': { fontSize: 28, fontWeight: '700' as const, lineHeight: 32, fontFamily: fontFamilies.display },
  'display-md': { fontSize: 22, fontWeight: '600' as const, lineHeight: 26, fontFamily: fontFamilies.display },
  'title-lg':   { fontSize: 18, fontWeight: '600' as const, lineHeight: 24, fontFamily: fontFamilies.body },
  'title-md':   { fontSize: 16, fontWeight: '600' as const, lineHeight: 22, fontFamily: fontFamilies.body },
  'body-lg':    { fontSize: 15, fontWeight: '400' as const, lineHeight: 22, fontFamily: fontFamilies.body },
  'body-md':    { fontSize: 14, fontWeight: '400' as const, lineHeight: 21, fontFamily: fontFamilies.body },
  'body-sm':    { fontSize: 13, fontWeight: '400' as const, lineHeight: 19, fontFamily: fontFamilies.body },
  'caption':    { fontSize: 12, fontWeight: '400' as const, lineHeight: 17, fontFamily: fontFamilies.body },
  'label':      { fontSize: 12, fontWeight: '600' as const, lineHeight: 16, fontFamily: fontFamilies.body },
  'price-lg':   { fontSize: 20, fontWeight: '700' as const, lineHeight: 24, fontFamily: fontFamilies.body },
  'price-md':   { fontSize: 16, fontWeight: '700' as const, lineHeight: 19, fontFamily: fontFamilies.body },
  'price-strike': { fontSize: 13, fontWeight: '400' as const, lineHeight: 18, fontFamily: fontFamilies.body },
} as const;

export type TypographyKey = keyof typeof typography;
