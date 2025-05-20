
import * as React from "react"

export type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

const breakpointValues = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536
};

export function useBreakpoint(breakpoint: Breakpoint) {
  const [isBelow, setIsBelow] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpointValues[breakpoint] - 1}px)`)
    const onChange = () => {
      setIsBelow(window.innerWidth < breakpointValues[breakpoint])
    }
    mql.addEventListener("change", onChange)
    setIsBelow(window.innerWidth < breakpointValues[breakpoint])
    return () => mql.removeEventListener("change", onChange)
  }, [breakpoint])

  return !!isBelow
}

export function useIsMobile() {
  return useBreakpoint("md");
}

export function useIsTablet() {
  return useBreakpoint("lg");
}

export function useIsDesktop() {
  return !useBreakpoint("lg");
}
