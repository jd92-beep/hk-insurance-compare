import * as React from "react"

/**
 * Foldable-friendly breakpoint.
 * Galaxy Fold / Pixel Fold half-open is often 573–717px; unfolded 843–904px.
 * Treat those as mobile/tablet research layouts so Compare does not force a
 * cramped desktop table that leaves an empty right gutter.
 */
const MOBILE_BREAKPOINT = 900

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
