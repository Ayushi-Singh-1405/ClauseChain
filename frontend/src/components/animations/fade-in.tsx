import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface FadeInRowProps {
  children: React.ReactNode
  className?: string
  delay?: number
  highlight?: boolean
}

export function FadeInRow({ children, className, delay = 0, highlight = true }: FadeInRowProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showHighlight, setShowHighlight] = useState(false)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true

    const timer = setTimeout(() => {
      setIsVisible(true)
      if (highlight) {
        setShowHighlight(true)
        setTimeout(() => setShowHighlight(false), 800)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [delay, highlight])

  return (
    <tr
      className={cn(
        "transition-all duration-300 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        showHighlight && "animate-highlight-pulse",
        className
      )}
    >
      {children}
    </tr>
  )
}

interface FadeInCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
  highlight?: boolean
}

export function FadeInCard({ children, className, delay = 0, highlight = true }: FadeInCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showHighlight, setShowHighlight] = useState(false)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true

    const timer = setTimeout(() => {
      setIsVisible(true)
      if (highlight) {
        setShowHighlight(true)
        setTimeout(() => setShowHighlight(false), 800)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [delay, highlight])

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        showHighlight && "animate-highlight-pulse",
        className
      )}
    >
      {children}
    </div>
  )
}