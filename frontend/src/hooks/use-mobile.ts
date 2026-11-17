import * as React from "react"

/**
 * Breakpoint configuration aligned with Tailwind CSS:
 * - Tailwind 'sm' = 640px
 * - Tailwind 'md' = 768px
 *
 * In Destino's layout and shadcn components (like Sidebar), "mobile" viewports
 * encompass screens narrower than the Tailwind 'md' breakpoint (< 768px, i.e. max-width: 767px).
 * Desktop/tablet layouts activate at 'md' (>= 768px).
 */
export const TAILWIND_MD_BREAKPOINT = 768
export const MOBILE_BREAKPOINT = TAILWIND_MD_BREAKPOINT
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(onChange: () => void) {
  const mediaQuery = window.matchMedia(MOBILE_QUERY)
  mediaQuery.addEventListener("change", onChange)
  return () => mediaQuery.removeEventListener("change", onChange)
}

function getSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches
}

function getServerSnapshot() {
  return false
}

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
