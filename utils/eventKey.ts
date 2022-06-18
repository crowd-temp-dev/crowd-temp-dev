type EventKey =
  | 'space'
  | 'enter'
  | 'esc'
  | 'tab'
  | `arrow_${'left' | 'right' | 'down' | 'up'}`
  | 'slash'
  | 'backspace'
  | 'delete'
  | ''

/**
 * @name eventKey
 * @description
 * Returns keys of some keyboard event
 * @param {KeyboardEvent} evt
 * @returns {EventKey}
 */
export default function eventKey(evt: KeyboardEvent): EventKey {
  const codeIs = (code: string) => new RegExp(code, 'i').test(evt.code)
  const keyCode = evt.keyCode

  if (codeIs('space') || keyCode === 32) return 'space'
  if (codeIs('enter') || keyCode === 13) return 'enter'
  if (codeIs('escape') || keyCode === 27) return 'esc'
  if (codeIs('tab') || keyCode === 9) return 'tab'
  if (codeIs('arrowLeft') || keyCode === 37) return 'arrow_left'
  if (codeIs('arrowUp') || keyCode === 38) return 'arrow_up'
  if (codeIs('arrowRight') || keyCode === 39) return 'arrow_right'
  if (codeIs('arrowDown') || keyCode === 40) return 'arrow_down'
  if (codeIs('slash') || keyCode === 191 || evt.key === '/') return 'slash'
  if (codeIs('backspace') || keyCode === 8) return 'backspace'
  if (codeIs('delete') || keyCode === 46) return 'delete'

  return ''
}
