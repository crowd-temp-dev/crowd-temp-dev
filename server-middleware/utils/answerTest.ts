import { getFullTest } from '~/database/models/CreateTests/utils'

// Returns current test type, and test index. Eg .../SimpleSurvey/1a
export const getCurrentTestIndex = (
  data: Awaited<ReturnType<typeof getFullTest>>['data'],
  index: `confirm-${number}${string}` | `${number}${string}` | 'done'
) => {
  if (index === 'done') {
    return 'done'
  }

  if (data) {
    const isConfirm = index.startsWith('confirm-')

    const qIndex = Number((index.match(/\d+/g) || [])[0])

    const qIndexLetter = ((index.match(/\d[a-z]$/g) || [])[0] || '').replace(
      /\d/g,
      ''
    )    

    if (qIndex && qIndexLetter) {
      const qType = data[`question-${qIndex}`].type

      return `${qType}/${index.replace(/confirm-/, '')}${
        isConfirm ? '/confirm' : ''
      }`
    }
  }
  return 'error'
}
