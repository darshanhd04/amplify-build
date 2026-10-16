/**
 * AMPLIFY Design System & Theme Tokens
 * Editorial, calm, accessible, and high-contrast mobile palette
 */

export const colors = {
  // Brand Greens
  forestGreen: '#174D3B',
  primaryGreen: '#267A56',
  lightGreen: '#32966A',
  softMint: '#E6F3EA',
  mintBadge: '#D4EBDC',
  darkForest: '#0F3327',

  // Backgrounds & Surfaces
  warmIvory: '#FAF8F2',
  surface: '#FFFFFF',
  surfaceSubtle: '#F6F8F6',
  surfaceElevated: '#FFFFFF',
  surfaceDark: '#1A231E',

  // Text & Typography
  charcoal: '#202723',
  textSecondary: '#68716B',
  textTertiary: '#8D9790',
  textInverse: '#FFFFFF',
  textInverseMuted: '#C2D1C8',

  // Borders & Dividers
  border: '#E4E8E3',
  borderFocus: '#267A56',
  borderSubtle: '#EFF2EE',

  // Functional & Semantic
  warning: '#D97706',
  warningLight: '#FEF3C7',
  warningBorder: '#FCD34D',
  
  error: '#DC2626',
  errorLight: '#FEE2E2',
  errorBorder: '#FCA5A5',

  success: '#16A34A',
  successLight: '#DCFCE7',
  successBorder: '#86EFAC',

  info: '#2563EB',
  infoLight: '#EFF6FF',
  infoBorder: '#BFDBFE',

  // Overlays
  overlay: 'rgba(15, 35, 25, 0.65)',
  shimmer: '#E8ECE8',
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
    serif: 'Georgia',
  },
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    hero: 28,
    display: 34,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  section: 40,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  card: {
    shadowColor: '#174D3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHover: {
    shadowColor: '#174D3B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  modal: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  bottomBar: {
    shadowColor: '#174D3B',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};
