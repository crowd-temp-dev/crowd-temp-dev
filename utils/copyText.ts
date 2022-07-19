export default function copyText(args: { text: string, onSuccess: () => void, onError: () => void }) {
  const { text, onSuccess = () => { }, onError = () => { } } = args;

  return new Promise((resolve) => {
    const oldBrowser = () => {
      try {
        const pseudoInput = document.createElement('input')
        pseudoInput.classList.add('sr-only')
        pseudoInput.setAttribute('tabindex', '-1')
        pseudoInput.setAttribute('aria-hidden', 'true')
        pseudoInput.value = text
        document.body.appendChild(pseudoInput)
        pseudoInput.select()

        document.execCommand('copy')
        document.body.removeChild(pseudoInput)
        onSuccess()
      } catch (e) {
        if (e) {
          onError()
        }
      } finally {
        resolve(true)
      }
    }

    if ('clipboard' in navigator) {
      try {
        navigator.clipboard.writeText(text)
        onSuccess()
        resolve(true)
      } catch (e) {
        if (e) {
          oldBrowser()
        }
      }
    } else oldBrowser()
  })
}
