import { suffixSlash } from '.'

/**
 * Adds slide and fade transitions to pages
 *
 *  */
export function dynamicPageTransition(arg: {
  to: any
  from?: any
  useFade?: boolean
}) {
  const { to, from, useFade } = arg

  // use a fade transition
  if (
    useFade ||
    suffixSlash(from?.path).split('/').length ===
      suffixSlash(to.path).split('/').length
  ) {
    return 'page-transition-fade'
  }

  // if coming from home, slide from right to left
  if (!from) {
    return 'page-transition-slide-right'
  }

  // if mysteriously coming from a longer path say /*/*, slide from (left : right)

  const toPathArray = suffixSlash(to.path).split('/') || []

  const fromPathArray = suffixSlash(from?.path).split('/') || []

  return fromPathArray.length > toPathArray.length
    ? 'page-transition-slide-left'
    : 'page-transition-slide-right'
}
