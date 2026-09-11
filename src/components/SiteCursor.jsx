import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const TRAIL_COUNT = 7
const TRAIL_STEP_MS = 28

const ROUTE_ACCENT = {
  '/': [91, 141, 239],
  '/about': [245, 158, 11],
  '/projects': [46, 204, 113],
  '/contact': [91, 141, 239],
}

export default function SiteCursor() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const cursorRef = useRef(null)
  const rippleRef = useRef(null)
  const trailRefs = useRef([])
  const pageAccent =
    ROUTE_ACCENT[location.pathname] || ROUTE_ACCENT['/']
  const pageAccentRef = useRef(pageAccent)

  const glowTargetsRef = useRef([])
  const buttonRectsRef = useRef([])

  useEffect(() => {
    pageAccentRef.current = pageAccent
    const [r, g, b] = pageAccent
    const gradient = `radial-gradient(circle, rgba(${r}, ${g}, ${b}, 0.45) 0%, rgba(${r}, ${g}, ${b}, 0.15) 40%, rgba(${r}, ${g}, ${b}, 0) 75%)`
    if (rippleRef.current) {
      rippleRef.current.style.background = gradient
    }
    for (const dot of trailRefs.current.filter(Boolean)) {
      dot.style.backgroundColor = `rgb(${r}, ${g}, ${b})`
    }
    for (const target of glowTargetsRef.current) {
      target.style.setProperty('--glow-strength', '0')
    }
    requestAnimationFrame(() => {
      glowTargetsRef.current = Array.from(
        document.querySelectorAll('.hero-name, .hero-nav__link')
      )
      buttonRectsRef.current = Array.from(
        document.querySelectorAll('.hero-nav__link')
      ).map((el) => el.getBoundingClientRect())
    })
  }, [pageAccent])

  useEffect(() => {
    const el = cursorRef.current
    const ripple = rippleRef.current
    const trail = trailRefs.current.filter(Boolean)
    if (!el) return

    const resolveBackgroundColor = (x, y) => {
      const stack = document.elementsFromPoint(x, y)
      for (const node of stack) {
        if (!(node instanceof Element)) continue
        const bg = window.getComputedStyle(node).backgroundColor
        const match = bg.match(/rgba?\(([^)]+)\)/)
        if (!match) continue
        const parts = match[1].split(',').map((s) => parseFloat(s.trim()))
        const [r, g, b, a = 1] = parts
        if (a === 0) continue
        return [r, g, b, a]
      }
      return [255, 255, 255, 1]
    }

    const luminance = ([r, g, b]) => {
      const channel = (c) => {
        const s = c / 255
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
      }
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
    }

    const resolveAccent = () => pageAccentRef.current

    const GLOW_TRIGGER_RADIUS = 100

    const distanceToRect = (px, py, rect) => {
      const dx = Math.max(rect.left - px, 0, px - rect.right)
      const dy = Math.max(rect.top - py, 0, py - rect.bottom)
      return Math.hypot(dx, dy)
    }

    const updateGlowStrengths = (x, y) => {
      const targets = glowTargetsRef.current
      for (const target of targets) {
        const rect = target.getBoundingClientRect()
        const mx = ((x - rect.left) / rect.width) * 100
        const my = ((y - rect.top) / rect.height) * 100
        target.style.setProperty('--mx', `${mx.toFixed(2)}%`)
        target.style.setProperty('--my', `${my.toFixed(2)}%`)
        const dist = distanceToRect(x, y, rect)
        const t = Math.max(
          0,
          Math.min(1, (GLOW_TRIGGER_RADIUS - dist) / GLOW_TRIGGER_RADIUS)
        )
        const strength = t * t
        target.style.setProperty('--glow-strength', strength.toFixed(3))
      }
    }

    const RIPPLE_HALF = 35
    const rippleOverlapsButton = (cursorX, cursorY) => {
      const rects = buttonRectsRef.current
      const rippleLeft = cursorX - RIPPLE_HALF
      const rippleRight = cursorX + RIPPLE_HALF
      const rippleTop = cursorY - RIPPLE_HALF
      const rippleBottom = cursorY + RIPPLE_HALF
      for (const r of rects) {
        if (
          r.right > rippleLeft &&
          r.left < rippleRight &&
          r.bottom > rippleTop &&
          r.top < rippleBottom
        ) {
          return true
        }
      }
      return false
    }

    const moveTrailLeader = (x, y) => {
      const leader = trail[0]
      if (!leader) return
      leader.style.transition = 'none'
      leader.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
    }

    const handleMove = (event) => {
      const x = event.clientX
      const y = event.clientY
      buttonRectsRef.current = Array.from(
        document.querySelectorAll('.hero-nav__link')
      ).map((el) => el.getBoundingClientRect())
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
      if (ripple) {
        ripple.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
        const [r, g, b] = resolveAccent()
        ripple.style.background = `radial-gradient(circle, rgba(${r}, ${g}, ${b}, 0.45) 0%, rgba(${r}, ${g}, ${b}, 0.15) 40%, rgba(${r}, ${g}, ${b}, 0) 75%)`
        if (rippleOverlapsButton(x, y)) {
          ripple.style.opacity = '0'
        } else {
          ripple.style.opacity = ''
        }
        for (const dot of trail) {
          dot.style.backgroundColor = `rgb(${r}, ${g}, ${b})`
        }
        ripple.classList.add('site-cursor__ripple--visible')
      }
      moveTrailLeader(x, y)
      updateGlowStrengths(x, y)
      const bg = resolveBackgroundColor(x, y)
      const l = luminance(bg)
      const cursorColor = l > 0.5 ? '#000000' : '#ffffff'
      el.style.background = cursorColor
      el.classList.add('site-cursor--visible')
    }
    const handleEnter = () => {
      el.classList.add('site-cursor--visible')
      if (ripple) ripple.classList.add('site-cursor__ripple--visible')
    }
    const handleLeave = () => {
      el.classList.remove('site-cursor--visible')
      if (ripple) ripple.classList.remove('site-cursor__ripple--visible')
      for (const target of glowTargetsRef.current) {
        target.style.setProperty('--glow-strength', '0')
      }
    }

    window.addEventListener('pointermove', handleMove)
    document.addEventListener('mouseenter', handleEnter)
    document.addEventListener('mouseleave', handleLeave)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      document.removeEventListener('mouseenter', handleEnter)
      document.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  return (
    <>
      <div ref={rippleRef} className="site-cursor__ripple" aria-hidden="true" />
      {isHome &&
        Array.from({ length: TRAIL_COUNT }).map((_, i) => (
          <div
            key={i}
            ref={(node) => {
              trailRefs.current[i] = node
            }}
            className="site-cursor__trail"
            style={{ transitionDelay: `${i * TRAIL_STEP_MS}ms` }}
            aria-hidden="true"
          />
        ))}
      <div ref={cursorRef} className="site-cursor" aria-hidden="true" />
    </>
  )
}
