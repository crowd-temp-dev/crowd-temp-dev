<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { validate } from 'uuid'
import layouts from '~/mixins/layouts'
import { Layout } from '~/types'
import { actionRoutes, uid } from '~/utils'
import { showToasts } from '~/utils/showToast'

export default defineComponent({
  name: 'ActionLayout',
  mixins: [layouts],
  data: () => ({
    pageTitle: '',
    loadingId: uid(),
  }),

  head() {
    return {
      title: this.pageTitle,
    }
  },

  created() {
    this.sendRequest()
  },

  methods: {
    sendRequest() {
      if (this.$route.path === '/action') {
        const { key, token, id } = this.$route.query as {
          key: keyof typeof actionRoutes
          token: string
          id: string
        }
        // check if it's a valid action
        if (!actionRoutes[key]) {
          return this.$nuxt.error({
            message: 'Forbidden action!',
            statusCode: 403,
          })
        }

        // check that there's a token and a userId;
        if (!id || !token || !validate(id) || !validate(token)) {
          return this.$nuxt.error({
            message: 'Incorrect credentials!',
            statusCode: 403,
          })
        }

        const { message, request, redirect } = actionRoutes[key]

        this.pageTitle = message

        this.$fullscreenLoading
          .show({
            message,
            id: this.loadingId,
          })
          .then(() => {
            request
              .call(this, {
                token,
                id,
              })
              .then(({ message }) => {
                showToasts(this.$pToast, message)

                this.$fullscreenLoading.hide({
                  id: this.loadingId,
                })

                if (this.$route.path !== redirect) {
                  this.$router.replace(redirect)
                }
              })
          })
      } else {
        this.$nuxt.setLayout(
          this.$user.loggedIn ? 'app' : ('landing-page' as Layout)
        )

        if (this.$route.path !== '/') {
          this.$router.replace('/')
        }
      }
    },
  },
})
</script>

<template>
  <div :class="{ 'hide-ui': !mounted }">
    <span v-if="!mounted" class="sr-only"> Loading... please wait. </span>
    <div class="sr-only">
      <NuxtChild />
    </div>
  </div>
</template>
