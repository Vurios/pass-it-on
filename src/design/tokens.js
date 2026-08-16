export const palette = {
  cream: '#FFF8ED',
  paper: '#FFFEFB',
  coral: '#FF5A5F',
  sunshine: '#FFC53D',
  ocean: '#2E86AB',
  lime: '#8BC34A',
  ink: '#1A1A1A',
  'accent-correct': '#5D9E36',
  'accent-incorrect': '#D93F45',
  'accent-warning': '#B97700',
  'accent-primary': '#D93F45',
  'accent-secondary': '#236C8C',
}

export const fontFamilies = {
  display: ['Fredoka', 'Arial Rounded MT Bold', 'sans-serif'],
  body: ['Space Grotesk', 'Arial', 'sans-serif'],
}

export const borderTokens = {
  width: '3px',
  color: palette.ink,
  radius: '18px',
}

export const shadowTokens = {
  small: `3px 3px 0 0 ${palette.ink}`,
  hard: `5px 5px 0 0 ${palette.ink}`,
  large: `7px 7px 0 0 ${palette.ink}`,
}

export const motionTokens = {
  fast: '100ms',
  medium: '250ms',
  slow: '500ms',
}

export const spacingTokens = {
  xs: 'clamp(0.35rem, 0.7cqi, 0.5rem)',
  sm: 'clamp(0.6rem, 1.2cqi, 0.85rem)',
  md: 'clamp(0.9rem, 1.8cqi, 1.25rem)',
  lg: 'clamp(1.35rem, 2.8cqi, 2rem)',
  xl: 'clamp(2rem, 4cqi, 3rem)',
}
