/**
 * Color Palette and Design Tokens
 * LinkedIn Design System
 */

export const colors = {
  // Background colors (macOS-friendly neutrals)
  bg: {
    primary: '#F6F6F7',
    window: '#FFFFFF',
    card: '#F2F2F7',
    sidebar: 'rgba(245,245,248,0.9)'
  },

  // Text colors
  text: {
    primary: '#1C1C1E',
    secondary: '#3C3C43',
    muted: '#6B6B70'
  },

  // Accent colors (macOS system blue)
  accent: {
    primary: '#0A84FF',
    primaryHover: '#0060DF'
  },

  // Status colors
  status: {
    // success: '#30D158',
    success: '#159969',
    // danger: '#FF3B30',
    danger: '#d62929',
    warning: '#FF9F0A',
    info: '#0A84FF'
  },

  // Border & divider
  border: {
    light: 'rgba(60,60,67,0.12)',
    lighter: 'rgba(60,60,67,0.08)'
  },

  // Glass / vibrancy
  glass: 'rgba(255,255,255,0.7)',
  glassDark: 'rgba(250,250,250,0.6)'
};

/**
 * Spacing and Layout
 */
export const spacing = {
  radius: '12px',
  radiusSmall: '8px',
  radiusMedium: '10px',
  radiusLarge: '12px',
};

/**
 * Shadow definitions
 */
export const shadows = {
  default: '0 2px 4px rgba(0,0,0,0.1)',
  light: '0 1px 2px rgba(0,0,0,0.05)',
  medium: '0 4px 12px rgba(0,0,0,0.15)',
  inset: 'inset 0 -6px 12px rgba(10,102,194,0.06)',
};

/**
 * Typography
 */
export const typography = {
  fontFamily: {
    display: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    body: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    fallback: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  fontSize: {
    xs: '11px',
    sm: '12px',
    base: '13px',
    md: '14px',
    lg: '15px',
    xl: '16px',
    '2xl': '20px',
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

/**
 * Breakpoints for responsive design
 */
export const breakpoints = {
  mobile: '640px',
  tablet: '768px',
  desktop: '900px',
};
