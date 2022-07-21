<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { Layout } from '~/types'
import { splitPath } from '~/utils'
import { dynamicPageTransition } from '~/utils/pageTransition'
import DialogButton from '~/components/Base/DialogButton/index.vue'

export default defineComponent({
  name: 'AppIntegrationsPage',
  components: { DialogButton },
  layout: 'app' as Layout,
  transition: (to, from) =>
    dynamicPageTransition({
      to,
      from,
      useFade:
        !from ||
        splitPath(to.path).length === splitPath(from?.path || '').length,
    }),
  setup() {},

  head: {
    title: 'Integrations',
    meta: [
      {
        name: 'description',
        content: "Suggest apps you'd like to see integrated in Crowd!",
        vmid: 'description',
        hid: 'description',
      },
    ],
  },
})
</script>

<template>
  <div class="w-full py-32 px-32">
    <div class="max-w-app mx-auto">
      <div
        class="max-w-[800px] p-20 rounded-lg bg-surface-default shadow-2 grid"
      >
        <h2 class="text-heading font-semibold">Available integrations</h2>

        <p class="my-20">
          We currently don't have any integrations available but we're working
          on making some available for you in due time. Kindly use the button
          below to recommend an integration you'd like to use with Crowd.
        </p>

        <hr class="h-1 w-[90%] bg-[#F7F7F7] mb-20 justify-self-end" />

        <div class="flex justify-end">
          <DialogButton
            primary
            :dialog-attrs="{
              title: 'Recommend an integration',
              bodyClass: 'min-w-[612px] pb-0',
              transition: 'slide-y',
            }"
          >
            Recommend an Integration

            <template #dialog>
              <FormLayout v-slot="{ idAndError }" name="suggest-integration">
                <TextField
                  label="What integration would offer more value to you"
                  placeholder="e.g Slack, Notion, Google Drive"
                  v-bind="idAndError('integrationTitle')"
                  required
                  autofocus
                />

                <TextField
                  label="Describe the value it would offer"
                  placeholder="The details of your recommendation"
                  v-bind="idAndError('integrationDesc')"
                  required
                  multiline
                  :min-height="92"
                />

                <div class="sticky bottom-0 z-1 bg-surface-default">
                  <hr class="h-1 w-full" />

                  <div class="h-78 flex-centered px-8">
                    <Button primary size="large" full-width type="submit">
                      Submit
                    </Button>
                  </div>
                </div>
              </FormLayout>
            </template>
          </DialogButton>
        </div>
      </div>
    </div>
  </div>
</template>
