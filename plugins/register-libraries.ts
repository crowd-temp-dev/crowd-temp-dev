// Register libraries that don't expose the nuxt install method.

import Vue from 'vue'
import PortalVue from 'portal-vue'
import VueCompositionApi from '@vue/composition-api'

// Shopify Polaris Vue component
import PolarisVue from '@hulkapps/polaris-vue'

import { polyfill } from 'smoothscroll-polyfill'

export default function () {
  polyfill()

  Vue.use(PolarisVue)

  Vue.use(VueCompositionApi)

  Vue.use(PortalVue, {
    portalName: 'Teleport',
    portalTargetName: 'TeleportTarget',
  })
}
