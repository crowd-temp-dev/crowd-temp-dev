import { uid } from '../../utils'

export default function setEnv() {
  process.env.OTHER_CHOICE_PREFIX = `*${uid()}*`
  process.env.SKIP_QUESTION_VALUE = `*${uid()}*`
}
