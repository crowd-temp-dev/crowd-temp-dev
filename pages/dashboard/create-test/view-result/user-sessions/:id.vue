<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { splitPath } from '~/utils'
import { dynamicPageTransition } from '~/utils/pageTransition'
import SearchField from '~/components/Base/SearchField/index.vue'
import FadeTransition from '~/components/Base/FadeTransition/index.vue'

export interface UserSession {
  name: string
  region: string
  compRate: number
  date: number
  avgDuration: number
  device: 'mobile' | 'desktop'
}

interface Tr {
  component?: string
  text?: string
  attrs?: Record<string, any>
  events?: Record<string, any>
  class?: string
  wrapperClass?: string
  textClass?: string
}

export default defineComponent({
  name: 'AppCreateTestViewResultUserSessionsPage',
  components: { SearchField, FadeTransition },

  transition: (to, from) => {
    const splitFrom = splitPath(from?.path || '')

    if (splitFrom[2] === 'view-result') {
      if (/analytics|comments/.test(splitFrom[3])) {
        return 'page-transition-slide-right'
      }
      return 'page-transition-slide-left'
    }

    return dynamicPageTransition({
      to,
      from,
    })
  },

  setup() {
    const sessions: UserSession[] = []

    const thead = [
      {
        title: 'Partipants',
        class: 'text-left px-16',
      },
      {
        title: 'Region',
        class: 'text-center px-16',
      },
      {
        title: 'Comp rate',
        class: 'text-left px-16',
      },
      {
        title: 'Date & Time',
        class: 'text-left px-16',
      },
      {
        title: 'Avg. Dur',
        class: 'text-left px-16',
      },
      {
        title: 'Device',
        class: 'text-left px-16',
      },
      {
        title: 'Action',
        class: 'text-left px-16',
      },
    ]

    const tbody: (Tr | string)[][] = [
      [
        {
          component: 'Checkbox',
          attrs: {
            id: 'CHANGETHIS',
            labelHidden: true,
          },
          text: 'Participant 1',
          wrapperClass: 'flex items-center space-x-12 pl-16',
          class: 'flex',
        },
        {
          component: 'Img',
          attrs: {
            alt: '** Flag',
            src: `http://purecatamphetamine.github.io/country-flag-icons/3x2/${'NG'.toUpperCase()}.svg`,
            hideReloadIcon: true,
          },
          class: 'h-16 w-16 shrink-0',
          wrapperClass: 'flex-centered',
        },
        {
          text: '100%',
          wrapperClass: 'px-16',
        },
        {
          text: '12/07/22 6:19PM',
          wrapperClass: 'px-16',
        },
        {
          text: '2.5 mins',
          wrapperClass: 'px-16',
        },
        {
          component: 'PIcon',
          attrs: {
            source: 'DesktopMajor',
          },
          class: 'fill-icon-default',
        },
        {
          component: 'Button',
          attrs: {
            plain: true,
            label: 'View',
          },
          wrapperClass: 'flex-centered',
        },
      ],
    ]

    return { sessions, thead, tbody }
  },

  fetch() {},

  head: {
    title: 'Test results user sessions',
  },
})
</script>

<template>
  <div class="rounded-lg p-20 bg-surface-default shadow-2">
    <div class="flex items-center mb-20">
      <h2 class="font-semibold text-heading">User sessions</h2>

      <div class="grow flex justify-end">
        <SearchField
          placeholder="Sessions"
          outlined
          class="bg-surface-default max-w-[372px] w-full"
        />
      </div>
    </div>

    <FadeTransition>
      <p
        v-if="sessions.length"
        class="bg-action-primary-disabled border border-divider px-10 h-40 rounded-[3px] w-full flex items-center text-text-subdued"
      >
        <strong> No user sessions yet </strong>
      </p>

      <table v-else class="w-full">
        <thead class="shadow-divide-bottom h-52">
          <th
            v-for="(th, i) in thead"
            :key="i"
            class="font-normal"
            :class="th.class"
          >
            {{ th.title }}
          </th>
        </thead>

        <tbody>
          <tr
            v-for="(tr, i) in tbody"
            :key="i"
            class="shadow-divide-bottom h-52"
          >
            <td v-for="(td, index) in tr" :key="`${i}-${index}`">
              <div v-if="td.component || td.text" :class="td.wrapperClass">
                <Component
                  :is="td.component"
                  v-bind="td.attrs"
                  :class="td.class"
                />

                <span v-if="td.text" :class="td.textClass">
                  {{ td.text }}
                </span>
              </div>

              <template v-else>
                {{ td }}
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </FadeTransition>
  </div>
</template>
