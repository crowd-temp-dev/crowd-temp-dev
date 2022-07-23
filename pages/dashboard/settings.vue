<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import { Layout } from '~/types'
import { splitPath } from '~/utils'
import { dynamicPageTransition } from '~/utils/pageTransition'

interface Link {
  title: 'Profile' | 'Team members' | 'Custom Branding' | 'Billing' | 'Plans'
  to: string
  active?: boolean
}

export default defineComponent({
  name: 'AppSettingsPage',
  components: {},
  layout: 'app' as Layout,
  // transition(_, from) {
  //   if (from) {
  //     return ['index', 'project', 'notes', 'billing'].includes(
  //       from.name || ''
  //     )
  //       ? 'page-transition-slide-down'
  //       : 'page-transition-slide-up'
  //   }
  //   return 'page-transition-fade'
  // },

  transition: (to, from) =>
    dynamicPageTransition({
      to,
      from,
      useFade:
        !from ||
        splitPath(to.path).length === splitPath(from?.path || '').length,
    }),

  setup(_, { root }) {
    const links = computed<Link[]>(() => {
      const getToAndActive = (path: string) => {
        const paths = splitPath(root.$route.path)

        return {
          to: path,
          active: paths[paths.length - 1] === path,
        }
      }

      return [
        {
          title: 'Profile',
          ...getToAndActive('profile'),
        },
        {
          title: 'Team members',
          ...getToAndActive('team-members'),
        },
        {
          title: 'Custom Branding',
          ...getToAndActive('custom-branding'),
        },
        {
          title: 'Plans',
          ...getToAndActive('plans'),
        },
        {
          title: 'Billing',
          ...getToAndActive('billing'),
        },
      ]
    })

    return {
      links,
    }
  },

  head: {
    title: 'Settings',
    meta: [
      {
        hid: 'description',
        name: 'descrition',
        content: 'Configure your account settings',
      },
    ],
  },
})
</script>

<template>
  <div class="pb-88">
    <div class="app-page-header !h-52 !relative !z-1 !justify-center mb-32">
      <div>
        <div
          class="w-full max-w-[860px] grid h-full grid-rows-[1fr,auto] -mb-1"
        >
          <nav class="h-full">
            <ul class="flex items-center space-x-32 h-full">
              <li
                v-for="link in links"
                :key="link.title"
                class="h-full relative isolate overflow-y-hidden transform-gpu font-semibold transition-opacity active:opacity-75"
                :class="{
                  'text-text-subdued ': !link.active,
                }"
              >
                <NuxtLink
                  replace
                  :to="link.to"
                  class="inline-flex items-center justify-center h-full w-full outline-none border-none focus-visible:underline fill-before before:-z-1 before:!h-[2px] before:!top-auto before:!bottom-0 before:bg-action-primary-default before:transition-[transform,opacity] before:transform-gpu focus-visible:before:!opacity-70 focus-visible:text-text-default transition-colors"
                  :class="{
                    'before:opacity-0 before:translate-y-[100%] active:before:scale-[0.95]':
                      !link.active,
                    'active:before:scale-[0.99]': link.active,
                    'before:delay-[75ms]': link.active,
                  }"
                >
                  {{ link.title }}
                </NuxtLink>
              </li>
            </ul>
          </nav>

          <hr />
        </div>
      </div>
    </div>

    <div v-if="$user.loggedIn" class="isolate w-full px-32">
      <div class="mx-auto max-w-app">
        <NuxtChild />
      </div>
    </div>
  </div>
</template>
