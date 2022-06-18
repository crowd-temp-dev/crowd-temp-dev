<template>
  <div
    class="max-w-[933px] px-32 xl:px-64 xxl:px-0 pb-112 min-w-[min(100%,933px)]"
  >
    <div
      class="grid gap-y-32"
      :class="{
        'max-w-[805px]': !upgraded,
        'max-w-[800px]': upgraded,
      }"
    >
      <template v-if="!upgraded">
        <UpgradeBanner @dismissed="upgraded = true" />

        <Section title="Create organization">
          <p>
            Click the button below to create an organization in order to add
            team members
          </p>

          <template #cta>
            <Button primary>
              {{
                upgraded
                  ? 'Create organization'
                  : 'Upgrade to create organization'
              }}
            </Button>
          </template>
        </Section>
      </template>

      <template v-else>
        <OrganizationDetail />

        <TeamDetail />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import UpgradeBanner from '../../components/Base/UpgradeBanner/index.vue'
import OrganizationDetail from '../../components/App/Settings/TeamMembers/OrganizationDetail/index.vue'
import { Layout } from '~/types'
import Section from '~/components/App/Settings/Section/index.vue'
import Button from '~/components/Base/Button/index.vue'
import TeamDetail from '~/components/App/Settings/TeamMembers/TeamDetail/index.vue'

export default defineComponent({
  name: 'AppSettingsTeamMembersPage',
  components: {
    Section,
    Button,
    UpgradeBanner,
    OrganizationDetail,
    TeamDetail,
  },
  layout: 'app' as Layout,
  transition(_, from) {
    if (from) {
      if (from.path.startsWith('/settings/')) {
        if (from.path.startsWith('/settings/profile')) {
          return 'page-transition-slide-left'
        }
        return 'page-transition-slide-right'
      }
    }
    return 'page-transition-fade'
  },
  setup() {
    const upgraded = ref(true)

    return { upgraded }
  },

  head: {
    title: 'Team members settings',
    meta: [
      {
        hid: 'description',
        name: 'descrition',
        content: 'Configure your account team members settings',
      },
    ],
  },
})
</script>

<style lang="postcss"></style>
