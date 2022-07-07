const plugin = require('tailwindcss/plugin')
const theme = require('./tailwindConfig/theme')

module.exports = {
  content: [
    './components/**/*.{vue,js}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './nuxt.config.{js,ts}',
    './store/**/*.ts',
    './database/seed/privacyAndPolicy',
    // './plugins/**/*.{js,ts}',
  ],
  mode: 'jit',
  theme,
  //   important: true,
  variants: {
    aspectRatio: ['responsive', 'hover'],
  },

  plugins: [
    plugin(({ addVariant }) => {
      addVariant('can-hover', ['@media (pointer: fine) and (hover: hover)'])
      addVariant('no-hover', ['@media (hover: none) or (pointer: coarse)'])
      addVariant('supports-backdrop-filter', [
        '@supports (backdrop-filter: blur(1px))',
      ])
      addVariant('not-supports-backdrop-filter', [
        '@supports not (backdrop-filter: blur(1px))',
      ])
      addVariant('landscape', '@media (orientation: landscape)')
      addVariant('portrait', '@media (orientation: portrait)')
      addVariant('portrait', '@media (orientation: portrait)')
    }),
    require('@tailwindcss/aspect-ratio'),
  ],
}