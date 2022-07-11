import { nextFrame, sleep, uid } from '.'
import { MessageObject } from '~/server-middleware/types'

/**
 * @name showToasts
 * @description
 * Shows messages from API as toasts in batches. Since message response is an array, show a toast for each of them with an offset, if they all come at once
 * @param {MessageObject[]} messages
 * **/
export async function showToasts(
  $pToast: Vue['$pToast'],
  messages?: MessageObject[]
) {
  if (!messages) {
    return Promise.resolve()
  }

  for (let i = 0; i < messages.length; i++) {
    const delay = i * (messages.length < 5 ? 1000 : 750)

    const { content, type, duration } = messages[i]

    await nextFrame()
    
    await sleep(delay)

    $pToast.open({
      id: uid(),
      message: content,
      error: type === 'error',
      duration,
      pauseOnHover: true,
    })
  }

  return Promise.resolve()
}
