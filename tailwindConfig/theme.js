const colors = require('./colors')
const typography = require('./typography')
const { getEntries } = require('./utils')

module.exports = {
  colors,
  ...typography,

  screens: {
    xxs: '0px',
    xs: '325px',
    s: '400px',
    sm: '600px',
    md: '1080px',
    lg: '1264px',
    xl: '1327px',
    xxl: '1800px',
  },
  borderRadius: {
    none: '0px',
    sm: '2px',
    DEFAULT: '4px',
    lg: '8px',
    xl: '12px',
    full: '9999px',
  },
  boxShadow: {
    none: 'none',
    1: '0px 1px 0px rgba(0, 0, 0, 0.05)',
    2: '0px 2px 1px rgba(0, 0, 0, 0.05), 0px 0px 1px rgba(0, 0, 0, 0.25)',
    3: '0px 0px 2px rgba(0, 0, 0, 0.2), 0px 2px 10px rgba(0, 0, 0, 0.1)',
    5: '0px 0px 4px rgba(0, 0, 0, 0.1), 0px 8px 40px rgba(0, 0, 0, 0.2)',
    card: '0px 0px 1px rgba(0, 0, 0, 0.25), 0px 1px 3px rgba(63, 63, 68, 0.15)',
    'divide-bottom': 'inset 0px -1px 0px #E1E3E5',
    'divide-header': '0px 2px 1px rgba(0, 0, 0, 0.05)',
  },
  spacing: {
    //   generate spacings from (-500 to 500)px
    ...getEntries(501, (index) => [index, `${index}px`]),
    ...getEntries(500, (index) => [`-${index + 1}`, `-${index + 1}px`]),
  },
  zIndex: {
    ...getEntries(50, (index) => [index, `${index}`]),
  },
  maxWidth: {
    app: '1080px',
  },
}
