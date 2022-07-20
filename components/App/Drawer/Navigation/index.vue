<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import TrapFocus from 'ui-trap-focus'
import Button from '~/components/Base/Button/index.vue'
import { sleep, oneFrame } from '~/utils'
import SlackIcon from '~/components/Base/Icon/SlackIcon.vue'
import { RouteDialog } from '~/types'

interface Link {
  icon: string
  customIcon?: boolean
  title: string
  to: string
  active?: boolean
  hideTracker?: boolean
  badge?: `${number}`
}

interface LinkGroup {
  title?: string
  links: Link[]
}

export default defineComponent({
  name: 'DrawerNavigation',
  components: { Button, SlackIcon },
  setup(_, { root }) {
    const replaceRoute = ref(false)

    const linkGroup = computed<LinkGroup[]>(() => {
      const routeQuery: RouteDialog = root.$route.query.dialog

      return [
        {
          links: [
            {
              icon: 'HomeMajor',
              title: 'Home',
              active:
                /^\/dashboard$|^(?:\/dashboard\/create-test\/?|\/notification\/?)/.test(
                  root.$route.path
                ),
              to: '/dashboard',
            },
            {
              icon: 'OrdersMajor',
              title: 'Notes',
              badge: '0',
              to: '/dashboard/notes',
              active: /^\/dashboard\/notes\/?/.test(root.$route.path),
            },
            {
              icon: 'AppsMajor',
              title: 'Integrations',
              to: '/dashboard/settings/billing',
              active: /^\/dashboard\/settings\/billing\/?/.test(
                root.$route.path
              ),
            },
            {
              icon: 'DeleteMajor',
              title: 'Trash',
              to: '/dashboard/settings/billing',
              active: /^\/dashboard\/settings\/billing\/?/.test(
                root.$route.path
              ),
            },
            {
              icon: 'SettingsMajor',
              title: 'Settings',
              to: '/dashboard/settings',
              active: /^\/dashboard\/settings\/?/.test(root.$route.path),
            },
          ],
        },
        {
          title: 'Beta',
          links: [
            {
              icon: 'EmailNewsletterMajor',
              title: 'Give feedback',
              to: '?dialog=give-feedback',
              active: routeQuery === 'give-feedback',
              hideTracker: true,
            },
            {
              icon: 'BugMajor',
              title: 'Report a bug',
              to: '?dialog=report-bug',
              active: routeQuery === 'report-bug',
              hideTracker: true,
            },
            {
              icon: 'ConfettiMajor',
              title: 'Request a feature',
              to: '?dialog=request-feature',
              active: routeQuery === 'request-feature',
              hideTracker: true,
            },
            {
              icon: 'EmailMajor',
              title: 'Contact us',
              to: '?dialog=contact-us',
              active: routeQuery === 'contact-us',
              hideTracker: true,
            },
            {
              icon: 'SlackIcon',
              title: 'Join our Slack',
              to: '#',
              customIcon: true,
              hideTracker: true,
            },
          ],
        },
      ]
    })

    const arrowFocus = (evt: KeyboardEvent) => {
      if (/ArrowDown|ArrowUp/.test(evt.key || evt.code)) {
        evt.preventDefault()

        replaceRoute.value = true

        new TrapFocus({
          loop: false,
          forward: (evt) => {
            return (evt.code || evt.key) === 'ArrowDown'
          },
          backward: (evt) => {
            return (evt.code || evt.key) === 'ArrowUp'
          },
        })
          .init(evt)
          .then(async (el) => {
            if (el) {
              if (el.closest('.main-section')) {
                el.click()
              }

              await sleep(oneFrame * 2)

              el.focus()

              await sleep(oneFrame * 2)

              replaceRoute.value = false
            }
          })
      }
    }

    const focusOnLinkClick = async (evt: PointerEvent) => {
      if (evt.isTrusted) {
        const { currentTarget } = evt

        await sleep(oneFrame * 10)
        ;(currentTarget as HTMLElement).focus()
      }
    }

    return { linkGroup, arrowFocus, focusOnLinkClick, replaceRoute }
  },
})
</script>

<template>
  <nav class="DrawerNav hide-scrollbar" @keydown="arrowFocus">
    <template v-for="({ links, title }, i) in linkGroup">
      <h2
        v-if="title"
        :key="title + i"
        class="uppercase text-text-disabled text-center truncate text-[12px] leading-[16px] font-semibold mb-16 mt-[calc(72px-24px)] xl:mt-[calc(96px-24px)]"
      >
        {{ title }}
      </h2>

      <ul
        :key="i"
        class="grid gap-y-10"
        :class="{
          'sticky top-0 z-1 bg-surface-default pb-24 main-section': i === 0,
        }"
      >
        <li
          v-for="link in links"
          :key="link.title"
          class="flex-centered relative ml-[1.5px]"
        >
          <Transition
            v-if="!link.hideTracker"
            name="indicator-transition"
            mode="out-in"
          >
            <div
              v-if="link.active"
              aria-hidden="true"
              class="bg-action-primary-default rounded-r w-3 h-full absolute left-[-1.5px] top-0"
            />
          </Transition>

          <Tooltip
            v-slot="{ events }"
            :label="link.title"
            placement="right"
            content-class="!text-body !rounded-[6px] !py-5 !px-10 !font-medium"
            arrow-size="7px"
          >
            <span v-on="events">
              <Button
                :to="link.to"
                plain-action
                class="link-button h-32 min-h-[32px] w-40 min-w-[40px] p-0"
                :class="{
                  'text-action-primary-default': link.active,
                  'bg-surface-pressed': link.active && link.hideTracker,
                }"
                :icon="link.customIcon ? undefined : link.icon"
                @keyup.enter="(evt) => evt.currentTarget.click()"
                @keyup.space.prevent="(evt) => evt.currentTarget.click()"
                @click.native="(evt) => i === 0 && focusOnLinkClick(evt)"
              >
                <Component :is="link.icon" v-if="link.customIcon" />
              </Button>
            </span>
          </Tooltip>
        </li>
      </ul>
    </template>
  </nav>
</template>

<style scoped lang="postcss">
.DrawerNav {
  @apply h-full row-start-2 col-start-1 col-end-2 py-24 bg-surface-default max-h-full overflow-y-auto isolate overflow-x-hidden pr-[1.5px];
  box-shadow: inset -1px 0px 0px #e4e5e7;
  width: var(--sidebar-width);
}

.indicator-transition-enter,
.indicator-transition-leave-to {
  @apply opacity-0 translate-x-[-100%] will-change-[transform,opacity];
}

.indicator-transition-enter-active {
  @apply delay-150;
}

.indicator-transition-enter-active,
.indicator-transition-leave-active {
  @apply transition-[transform,opacity] will-change-[transform,opacity];
}
</style>
