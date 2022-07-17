<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api'
import TrapFocus from 'ui-trap-focus'
import Button from '~/components/Base/Button/index.vue'
import { sleep, oneFrame } from '~/utils'

interface Link {
  icon: 'HomeMajor' | 'OrdersMajor' | 'ReceiptMajor' | 'SettingsMajor'
  title: 'Home' | 'Notes' | 'Billing' | 'Settings'
  to: string
  active?: boolean
  badge?: `${number}`
}

export default defineComponent({
  name: 'DrawerNavigation',
  components: { Button },
  setup(_, { root }) {
    const replaceRoute = ref(false)

    const links = computed<Link[]>(() => [
      {
        icon: 'HomeMajor',
        title: 'Home',
        active: /^\/dashboard$|^(?:\/dashboard\/create-test\/?|\/notification\/?)/.test(
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
        icon: 'ReceiptMajor',
        title: 'Billing',
        to: '/dashboard/settings/billing',
        active: /^\/dashboard\/settings\/billing\/?/.test(root.$route.path),
      },
      {
        icon: 'SettingsMajor',
        title: 'Settings',
        to: '/dashboard/settings',
        active: /^\/dashboard\/settings\/?/.test(root.$route.path),
      },
    ])

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
            el?.click()

            await sleep(oneFrame * 2)

            el?.focus()

            await sleep(oneFrame * 2)

            replaceRoute.value = false
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

    return { links, arrowFocus, focusOnLinkClick, replaceRoute }
  },
})
</script>

<template>
  <nav class="DrawerNav">
    <ul class="grid gap-y-10" @keydown="arrowFocus">
      <li v-for="link in links" :key="link.to" class="px-8 relative">
        <Transition name="indicator-transition" mode="out-in">
          <div
            v-if="link.active"
            aria-hidden="true"
            class="bg-action-primary-default rounded-r w-3 h-full absolute left-0 top-0"
          />
        </Transition>

        <Button
          :to="link.to"
          plain-action
          full-width
          class="link-button h-32 min-h-[32px]"
          :class="{
            'text-action-primary-default': link.active,
          }"
          @keyup.enter="(evt) => evt.currentTarget.click()"
          @click.native="focusOnLinkClick"
        >
          <div class="flex items-center justify-between w-full">
            <PIcon
              :source="link.icon"
              class="mr-18"
              :class="{ 'fill-icon': link.active }"
            />

            <span class="inline-block flex-grow text-left">
              {{ link.title }}
            </span>

            <span
              v-if="link.badge"
              class="ml-18 rounded-[9px] bg-surface-neutral-default h-18 w-18 py-1 px-5 flex items-center justify-center text-text-default"
            >
              {{ link.badge }}
            </span>
          </div>
        </Button>
      </li>
    </ul>
  </nav>
</template>

<style scoped lang="postcss">
.DrawerNav {
  @apply h-full row-start-2 col-start-1 col-end-2 py-24 bg-surface-default;
  box-shadow: inset -1px 0px 0px #e4e5e7;
  width: var(--sidebar-width);
}

.link-button >>> .Polaris-Button__Text {
  width: 100%;
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
