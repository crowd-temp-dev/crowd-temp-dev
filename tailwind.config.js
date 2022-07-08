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
      addVariant('lock-html-scroll', [
        ':root[data-overlay-active] &',
        ':root[data-overlay-active]&',
      ])
      addVariant('windows-os', [
        ':root[data-os-windows] &',
        ':root[data-os-windows]&',
      ])
      addVariant('mac-os', [':root[data-os-mac] &', ':root[data-os-mac]&'])
    }),
    require('@tailwindcss/aspect-ratio'),
  ],
}
