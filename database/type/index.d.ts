export type UserSession = Record<string, {
  userAgent: string,
  expires: number
}>
export type UserAction = Record<string, number>

export type DesignSurveyFileType = 'image' | 'video'

export type DesignSurveyFrameType = 'no-frame'