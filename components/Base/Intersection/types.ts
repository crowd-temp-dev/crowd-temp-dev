type Margin = `${number}${'px' | '%'}`

export interface Config {
  threshold?: number | number[]
  rootMargin?:
    | Margin
    | `${Margin} ${Margin}`
    | `${Margin} ${Margin} ${Margin}`
    | `${Margin} ${Margin} ${Margin} ${Margin}`
  root?: HTMLElement | null
}

export interface Entry {
  inactive?: boolean
  boundingClientRect: DOMRectReadOnly | undefined
  intersectionRect: DOMRectReadOnly | undefined
  target: Element | undefined
  intersectionRatio: number
  isIntersecting: boolean
  rootBounds: DOMRectReadOnly | null
  time: number
}
