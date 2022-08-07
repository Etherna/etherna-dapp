import React, { useEffect, useMemo, useState } from "react"

type BreakpointProps = {
  children: React.ReactNode;
};

const getBreakpointComponent = (breakpoint: string) => {
  const Component: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <>{children}</>
  )
  Component.displayName = `Breakpoint${breakpoint}`

  return Component
}

const breakpoints = {
  xs: 360,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
}

type BreakpointComponent = ReturnType<typeof getBreakpointComponent>;

const Breakpoint: React.FC<BreakpointProps> & {
  Zero: BreakpointComponent;
  Xs: BreakpointComponent;
  Sm: BreakpointComponent;
  Md: BreakpointComponent;
  Lg: BreakpointComponent;
  Xl: BreakpointComponent;
  Xxl: BreakpointComponent;
} = ({ children }) => {
  const [width, setWidth] = useState(0)

  const childSizeMap = useMemo(() => {
    const brekpointComponents = React.Children.toArray(children).filter(
      (child) =>
        child && (child as any).type?.displayName?.startsWith("Breakpoint")
    ) as unknown as BreakpointComponent[]
    const childSizeMap: Record<number, BreakpointComponent> = {}

    for (const child of brekpointComponents) {
      switch ((child as any).type.displayName) {
        case "BreakpointZero":
          childSizeMap[0] = child
          break
        case "BreakpointXs":
          childSizeMap[breakpoints.xs] = child
          break
        case "BreakpointSm":
          childSizeMap[breakpoints.sm] = child
          break
        case "BreakpointMd":
          childSizeMap[breakpoints.md] = child
          break
        case "BreakpointLg":
          childSizeMap[breakpoints.lg] = child
          break
        case "BreakpointXl":
          childSizeMap[breakpoints.xl] = child
          break
        case "BreakpointXxl":
          childSizeMap[breakpoints.xxl] = child
          break
      }
    }
    return childSizeMap
  }, [children])

  useEffect(() => {
    let timeout: number

    const updateWidth = () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        setWidth(document.documentElement.clientWidth)
      }, 500) as unknown as number
    }

    const resizeObserver = new ResizeObserver(updateWidth)
    resizeObserver.observe(document.documentElement)

    setWidth(document.documentElement.clientWidth)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const getComponentForWidth = (width: number) => {
    const availableBreakpints = Object.keys(childSizeMap)
      .map((b) => +b)
      .sort((a, b) => b - a)

    for (const breakpoint of availableBreakpints) {
      if (breakpoint < width) return childSizeMap[breakpoint]
    }

    return null
  }

  return <>{getComponentForWidth(width)}</>
}
Breakpoint.Zero = getBreakpointComponent("Zero")
Breakpoint.Xs = getBreakpointComponent("Xs")
Breakpoint.Sm = getBreakpointComponent("Sm")
Breakpoint.Md = getBreakpointComponent("Md")
Breakpoint.Lg = getBreakpointComponent("Lg")
Breakpoint.Xl = getBreakpointComponent("Xl")
Breakpoint.Xxl = getBreakpointComponent("Xxl")

export default Breakpoint
