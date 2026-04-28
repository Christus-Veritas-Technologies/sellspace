/**
 * Font family constants for the Sellspace native app.
 * Weights loaded via @expo-google-fonts in app/_layout.tsx.
 */

export const fontFamilies = {
  /** Fraunces 700 — display headings */
  displayBold: "Fraunces_700Bold",
  /** Fraunces 600 — section headers */
  displaySemiBold: "Fraunces_600SemiBold",
  /** Fraunces 400 — body display text */
  displayRegular: "Fraunces_400Regular",
  /** DM Sans 400 — default body text */
  sansRegular: "DMSans_400Regular",
  /** DM Sans 500 — medium weight UI */
  sansMedium: "DMSans_500Medium",
  /** DM Sans 700 — bold UI, prices */
  sansBold: "DMSans_700Bold",
} as const;

export type FontFamily = (typeof fontFamilies)[keyof typeof fontFamilies];
