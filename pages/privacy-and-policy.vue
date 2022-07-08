<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import { Layout } from '~/types'
import { dynamicPageTransition } from '~/utils/pageTransition'
import { PrivacyAndPolicyState } from '~/store/privacy-and-policies'

export default defineComponent({
  name: 'PrivacyAndPolicyPage',
  layout: 'landing-page' as Layout,

  transition: (to, from) =>
    dynamicPageTransition({
      to,
      from,
    }),

  setup(_, { root }) {
    const state = computed(() => {
      return root.$store.state['privacy-and-policies'] as PrivacyAndPolicyState
    })

    const updatedAt = computed(() => {
      if (state.value.content) {
        const [date, month, year] = new Date(state.value.content.updatedAt)
          .toLocaleDateString()
          .split('/')

        return `${year}-${date}-${month}`
      }
      return ''
    })

    const intro = computed(() => {
      if (state.value.content) {
        return state.value.content.intro
      } else return []
    })

    const sections = computed(() => {
      if (state.value.content) {
        return state.value.content.sections
      } else return []
    })

    const hasHtml = /<[a-z]*.+?(?:>.+<\/[a-z]+?>|\/>)/

    return { state, updatedAt, intro, sections, hasHtml }
  },

  async fetch(ctx) {
    await ctx.store.dispatch('privacy-and-policies/getContent')
  },

  head: {
    title: 'Privacy and Policy',
    meta: [
      {
        name: 'description',
        content: 'Our privacy and policy - Crowd Mvp',
        hid: 'description',
      },
    ],
  },
})
</script>

<template>
  <main class="min-h-full w-full bg-sky-light">
    <div v-if="state.loading" class="w-full mt-[10%] flex-centered">
      <p
        class="text-text-subdued text-display-medium font-sf-pro-display font-semibold animate-pulse"
      >
        Loading...
      </p>
    </div>

    <div v-else class="pb-72">
      <h2
        class="text-center px-16 font-sf-pro-display font-semibold text-display-medium pt-64"
      >
        Crowd Privacy Policy
      </h2>

      <div
        class="bg-surface-default max-w-[calc(100%-16px)] md:max-w-[1000px] rounded-[5px] p-20 px-16 md:px-20 lg:px-30 lg:p-30 mt-16 mx-auto"
      >
        <h3 class="text-text-subdued text-center mb-20">
          Updated at {{ updatedAt }}
        </h3>

        <hr class="h-1 w-full border-t border-[#F7F7F7]" />

        <div class="max-w-[832px] mx-auto">
          <section class="pt-20">
            <p v-for="(content, i) in intro" :key="i" class="mb-20">
              {{ content }}
            </p>
          </section>

          <div class="grid gap-y-20">
            <section v-for="({ title, content }, i) in sections" :key="i">
              <h4 class="font-semibold text-[18px] leading-[20px] mb-8">
                {{ title }}
              </h4>

              <div class="grid gap-y-12">
                <template v-for="(contentValue, contentIndex) in content">
                  <VHTML
                    v-if="typeof contentValue === 'string'"
                    :key="`${contentIndex}-${i}-${title}-string`"
                    :use-html="hasHtml.test(contentValue)"
                    :text="contentValue"
                    tag="p"
                  />

                  <ul
                    v-else-if="contentValue.constructor === Array"
                    :key="`${contentIndex}-${i}-${title}-array`"
                    class="list-disc ml-16"
                  >
                    <VHTML
                      v-for="(
                        contentValueListItem, contentValueListItemIndex
                      ) in contentValue"
                      :key="`${contentIndex}-${i}-${title}-ul-${contentValueListItemIndex}`"
                      :use-html="hasHtml.test(contentValueListItem)"
                      :text="contentValueListItem"
                      tag="li"
                    />
                  </ul>

                  <div
                    v-else-if="typeof contentValue === 'object'"
                    :key="`${contentIndex}-${i}-${title}-object`"
                  >
                    <h5 class="font-semibold mb-4 text-[15px]">
                      {{ contentValue.title }}
                    </h5>

                    <VHTML
                      v-for="(
                        contentValueItem, contentValueItemIndex
                      ) in contentValue.content"
                      :key="`${contentIndex}-${i}-${title}-object-${contentValueItemIndex}`"
                      :use-html="hasHtml.test(contentValueItem)"
                      :text="contentValueItem"
                      tag="p"
                    />
                  </div>
                </template>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
