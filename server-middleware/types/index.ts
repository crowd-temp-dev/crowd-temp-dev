import { ApiAction } from "~/types"

export interface MessageObject {
  type: 'error' | 'success' | 'warning'
  content: string
  duration?: number
}

export type UserRole = 'user' | 'tester'

export type UserNotificationBadge = "What's new" | 'Updates' | 'Action required'
export interface UserNotificationAction {
  attrs: Record<string, any>
  title: string
  on: Record<string, Function>
}

export interface UserNotification {
  type: UserNotificationBadge
  title: string
  time?: number
  description: string
  action?: UserNotificationAction[]
}

export interface UserData {
  name: string
  email: string
  newsUpdate: boolean
  role: UserRole
  showDashboardGuide:boolean
  notification: UserNotification[]
}

export type CreateTestProgress = 'Daft: Create' | 'Draft: Recruit' | 'Completed'

export interface ActionQuery {
  key: ApiAction
  token: string
  id: string
}

