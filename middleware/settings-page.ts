import { Middleware } from '@nuxt/types'

const redirectSettingsPage: Middleware = function ({ redirect, route }) {
  //   if client is on /settings/?, and trying to access /settings/['profile' | 'team-members' | 'custom-branding' | 'billing'], allow, else redirect to sign-up

  const paths = route.path.split('/').filter(Boolean)

  if (paths[0] === 'settings') {
    // check if the second path is valid
    const validSettingsTabs = [
      'profile',
      'team-members',
      'custom-branding',
      'billing',
      'plans',
    ]

    if (!validSettingsTabs.includes(paths[1])) {
      redirect(200, '/settings/profile')
    }
  }
}

export default redirectSettingsPage
