import Vue from 'vue'
import PortalVue from 'portal-vue'
import VueCompositionApi from '@vue/composition-api'
import cloudinary from 'cloudinary-vue'

// Shopify Polaris Vue component
import PolarisVue from '@hulkapps/polaris-vue'

import { polyfill } from 'smoothscroll-polyfill'
import { Plugin } from '@nuxt/types'

const registerLibraries: Plugin = function ({env}) {
  Vue.use(PolarisVue)

  Vue.use(VueCompositionApi)

  Vue.use(PortalVue, {
    portalName: 'Teleport',
    portalTargetName: 'TeleportTarget',
  })

  Vue.use(cloudinary, {
    configuration: {
      cloudName: env.CLOUDINARY_NAME,
      secure: true,
    },
  })

  polyfill()
}

export default registerLibraries
