import { NuxtConfig } from '@nuxt/types'
import {
  addTransitioningDataAttr,
  htmlAttrs,
  removeTransitioningDataAttr,
} from './utils'

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'server',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s - Unbug QA Crowd app',
    title: 'Loading, please wait ...',
    htmlAttrs,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: 'https://res.cloudinary.com/crowd-mvp/image/upload/v1656851512/static/favicon.png',
      },
      {
        rel: 'preconnect',
        hid: 'google-font-preconnect-1',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        hid: 'google-font-preconnect-2',
        href: 'https://fonts.gstatic.com',
        crossorigin: '',
      },
      {
        rel: 'stylesheet',
        hid: 'google-roboto-and-epilogue-font',
        href: 'https://fonts.googleapis.com/css2?family=Epilogue:wght@500&family=Roboto&display=swap&family=Mulish&display=swap',
      },
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '@hulkapps/polaris-vue/dist/polaris-vue.min.css',
    '@assets/css/tailwind.css',
    '@assets/css/reset.css',
    '@assets/css/sf-pro-display.css',
    '@assets/css/sf-pro-text.css',
    '@assets/css/utilities.css',
    '@assets/css/variables.css',
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '@/plugins/register-libraries',
    '@/plugins/register-components',
    '@plugins/alertDialog',
    '@/plugins/fullscreenLoading',
    '@/plugins/user',
    '@/plugins/breakpoint',
    '@/plugins/init',
    '@/plugins/autoLogin',
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: false,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',

    // For Vite ⚡
    'nuxt-vite',

    // For tailwind
    '@nuxt/postcss8',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',

    'cookie-universal-nuxt',
  ],

  axios: {
    baseURL: process.env.API_BASE_URL,
  },

  publicRuntimeConfig: {
    axios: {
      baseURL: process.env.API_BASE_URL,
      https: true,
      retry: true,
      credentials: true,
      debug: process.env.NODE_ENV === 'development',
      headers: {
        common: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Expires: '0',
        },
      },
    },
    otherPrefix: process.env.OTHER_CHOICE_PREFIX,
    skipQuestion: process.env.SKIP_QUESTION_VALUE,
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    // For tailwind
    postcss: {
      plugins: {
        tailwindcss: {},
        autoprefixer: {},
      },
    },
    // quiet: true
  },

  vite: {
    // build: true,
  },

  router: {
    middleware: ['auth-page', 'settings-page', 'create-test'],
  },

  loading: {
    color: '#267DFF',
  },

  server: {
    ...(process.env.NODE_ENV === 'production' ? {} : { port: 2222 }),
    host: '0.0.0.0',
  },

  serverMiddleware: [
    { path: 'api/v1', handler: './server-middleware/index' },
    './server-middleware/baseEndpoint',
  ],

  env: {
    CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
  },

  typescript: {
    typeCheck: {
      eslint: {
        files: './**/*.{ts,js,vue}',
      },
    },
  },

  extends: ['@nuxtjs/eslint-config-typescript'],

  transition: {
    beforeEnter: addTransitioningDataAttr,
    enter: addTransitioningDataAttr,
    afterEnter: removeTransitioningDataAttr,
    beforeLeave: addTransitioningDataAttr,
    leave: addTransitioningDataAttr,
    afterLeave: removeTransitioningDataAttr,
  },
} as unknown as NuxtConfig
