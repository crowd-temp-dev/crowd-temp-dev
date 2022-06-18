export default function copyText(args: { text: string, onSuccess: () => void, onError: () => void }) {
  const { text, onSuccess = () => { }, onError = () => { } } = args;

  return new Promise((resolve) => {
    const oldBrowser = () => {
      try {
        const psuedoInput = document.createElement('input')
        psuedoInput.classList.add('sr-only')
        psuedoInput.setAttribute('tabindex', '-1')
        psuedoInput.setAttribute('aria-hidden', 'true')
        psuedoInput.value = text
        document.body.appendChild(psuedoInput)
        psuedoInput.select()

        document.execCommand('copy')
        document.body.removeChild(psuedoInput)
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
