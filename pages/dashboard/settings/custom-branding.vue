<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { Layout } from '~/types'
import UpgradeBanner from '~/components/Base/UpgradeBanner/index.vue'
import Section from '~/components/App/Settings/Section/index.vue'
import Button from '~/components/Base/Button/index.vue'

export default defineComponent({
  name: 'AppSettingsCustomBrandingPage',
  components: { UpgradeBanner, Section, Button },
  layout: 'app' as Layout,
  transition(_, from) {
    if (from) {
      if (from.path.startsWith('/settings/')) {
        if (/^\/settings\/(?:profile|team-members)\/?/.test(from.path)) {
          return 'page-transition-slide-left'
        }
        return 'page-transition-slide-right'
      }
    }
    return 'page-transition-fade'
  },
  setup() {},

  head: {
    title: 'Custom branding settings',
    meta: [
      {
        hid: 'description',
        name: 'descrition',
        content: 'Configure your account custom branding settings',
      },
    ],
  },
})
</script>

<template>
  <div class="max-w-app mx-auto px-32 xl:px-40 xxl:px-0 pb-112">
    <div class="grid gap-y-32 max-w-[805px]">
      <UpgradeBanner />

      <Section title="Brand style">
        <template #cta>
          <Button primary> Upgrade to save changes </Button>
        </template>

        <div class="flex items-center mb-20">
          <PAvatar customer size="large" class="mr-10 shrink-0" />

          <div>
            <strong class="mb-4"> Edit your logo </strong>

            <div class="flex space-x-10 items-center">
              <Button
                plain
                class="text-interactive-critical hover:text-interactive-critical-hovered active:text-interactive-critical-depressed text-body pr-0"
              >
                Delete
              </Button>

              <Button plain class="text-body"> Update </Button>
            </div>
          </div>
        </div>

        <div class="plain-upload mt-24">
          <PDropZone
            :label-action="{}"
            type="image"
            outline
            :files="[]"
            :handle-on-drop="() => {}"
            action-title="Add file"
          />
        </div>

        <p class="my-20">
          The image you choose here will be used instead of the Crowd’s logo
          when you recruit users with the share link. We recommend using a PNG
          with a transparent background.
        </p>

        <PFormLayout>
          <div>
            <p>Button color</p>

            <div class="h-36 rounded bg-action-primary-default my-4" />

            <p class="text-text-subdued">
              This will be used as the button background color when you recruit
              users with the share link.
            </p>
          </div>

          <Select
            value="eng"
            label="Default language"
            :options="[
              {
                label: 'English',
                value: 'eng',
              },
            ]"
          />
        </PFormLayout>
      </Section>
    </div>
  </div>
</template>
