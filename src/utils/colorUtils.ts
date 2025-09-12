/**
 * Converts a hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculates the relative luminance of a color
 * Based on WCAG 2.0 guidelines
 */
function getLuminance(r: number, g: number, b: number): number {
  // Convert RGB to relative luminance
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates the contrast ratio between two colors
 * Based on WCAG 2.0 guidelines
 */
function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 1;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Determines whether to use white or black text on a colored background
 * for optimal contrast based on WCAG guidelines
 *
 * @param backgroundColor - Hex color string (e.g., "#FF0000")
 * @param minContrast - Minimum contrast ratio to consider acceptable (default: 3.5)
 * @returns "#FFFFFF" for white text or "#000000" for black text
 */
export function getContrastingTextColor(
  backgroundColor: string,
  minContrast: number = 3.5
): string {
  const blackContrast = getContrastRatio(backgroundColor, "#000000");

  // Only use black text if it has very good contrast (6+ ratio)
  // This means only very bright/light colors will get black text
  // Everything else gets white text for better readability
  return blackContrast >= 6.0 ? "#000000" : "#FFFFFF";
}

/**
 * Checks if a color combination meets WCAG contrast requirements
 *
 * @param foreground - Hex color string
 * @param background - Hex color string
 * @param level - 'AA' (4.5:1) or 'AAA' (7:1) compliance level
 * @returns boolean indicating if the contrast is sufficient
 */
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  level: "AA" | "AAA" = "AA"
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = level === "AAA" ? 7 : 4.5;
  return ratio >= requiredRatio;
}

/**
 * Gets the user's primary color or falls back to the default primary color
 * This allows the entire app to use the user's personalized color as the primary theme
 *
 * @param userColor - The user's selected color (optional)
 * @param fallbackColor - The default primary color to use if user color is not available
 * @returns The color to use as primary
 */
export function getUserPrimaryColor(userColor?: string, fallbackColor?: string): string {
  return userColor || fallbackColor || '#007AFF'; // iOS blue as ultimate fallback
}
