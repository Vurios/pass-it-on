import { borderTokens, fontFamilies, palette, shadowTokens } from './src/design/tokens.js'

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: palette,
      fontFamily: {
        display: fontFamilies.display,
        body: fontFamilies.body,
      },
      borderWidth: {
        chunky: borderTokens.width,
      },
      boxShadow: {
        hard: shadowTokens.hard,
        'hard-sm': shadowTokens.small,
        'hard-lg': shadowTokens.large,
      },
    },
  },
}
