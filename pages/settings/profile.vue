<template>
  <div
    class="grid grid-cols-[1fr,auto] grid-flow-col gap-x-32 max-w-app mx-auto px-32 xl:px-64 xxl:px-0 min-w-full"
  >
    <!-- main content -->
    <div class="grid gap-y-32">
      <PersonalInfo />

      <EmailPreference />

      <ChangePassword />

      <DeleteAccount />

      <p v-if="provider" class="text-center text-text-subdued mt-20">
        Account managed by {{ provider }}
      </p>
    </div>

    <!-- aside -->
    <Photo />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import Photo from '../../components/App/Settings/Profile/Photo/index.vue'
import EmailPreference from '../../components/App/Settings/Profile/EmailPreference/index.vue'
import PersonalInfo from '../../components/App/Settings/Profile/PersonalInfo/index.vue'
import ChangePassword from '../../components/App/Settings/Profile/ChangePassword/index.vue'
import DeleteAccount from '../../components/App/Settings/Profile/DeleteAccount/index.vue'
import { Layout } from '~/types'

export default defineComponent({
  name: 'AppSettingsProfilePage',
  components: {
    Photo,
    PersonalInfo,
    EmailPreference,
    ChangePassword,
    DeleteAccount,
  },
  layout: 'app' as Layout,
  transition(_, from) {
    if (from) {
      // always use backward transition if routing from /settings/*
      if (from.path.startsWith('/settings/')) {
        return 'page-transition-slide-right'
      }
    }
    return 'page-transition-fade'
  },
  setup(_, { root: { $user } }) {
    const provider = computed(() => {
      if ($user.provider === 'email') {
        return null
      }

      return $user.provider.replace(/[a-z]/, (x) => x.toUpperCase())
    })

    return { provider }
  },

  head: {
    title: 'Profile settings',
    meta: [
      {
        hid: 'description',
        name: 'descrition',
        content: 'Configure your account profile settings',
      },
    ],
  },
})
</script>

<style scoped></style>
