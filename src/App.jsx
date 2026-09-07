import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { SplitText } from 'gsap/SplitText'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import './App.css'
import { ThemeProvider } from './theme-context'

gsap.registerPlugin(useGSAP, ScrambleTextPlugin, SplitText)

// Entrance animation hook.
function useGsapEntrance(rootRef) {
  useGSAP(
    () => {
      gsap.fromTo(
        '.hero-portrait',
        { autoAlpha: 0, scale: 0.92 },
        { autoAlpha: 1, scale: 1, duration: 1.1, ease: 'power3.out' }
      )
      gsap.fromTo(
        '.hero-name',
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.15 }
      )
      gsap.fromTo(
        '.hero-nav__link',
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08, delay: 0.35 }
      )
    },
    { scope: rootRef }
  )
}

// Reusable bits.
function PortraitImage() {
  return (
    <div
      className="hero-portrait"
      aria-label="Profile photo"
      style={{
        backgroundImage: 'url(/src/assets/rocket_ship.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  )
}

// Heading: glow variables (--glow-strength, --mx, --my) are set by SiteCursor.
function HeroName({ children }) {
  return (
    <h1 className="hero-name" data-text={children} tabIndex={0}>
      {children}
    </h1>
  )
}

function HeroSubheading({ children }) {
  return (
    <h2 className="hero-name hero-name--sub" data-text={children} tabIndex={0}>
      {children}
    </h2>
  )
}

// Nav: glow variables are set by SiteCursor.
function Nav({ links }) {
  return (
    <nav className="hero-nav" aria-label="Primary">
      {links.map((link) => (
        <Link key={link.to} to={link.to} className="hero-nav__link">
          {link.label}
        </Link>
      ))}
    </nav>
  )
}

const HOME_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
]

const SUBPAGE_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
]

// Pages.
const TRAIL_COUNT = 7
const TRAIL_STEP_MS = 28

const ROUTE_ACCENT = {
  '/': [91, 141, 239],
  '/about': [46, 204, 113],
  '/projects': [245, 158, 11],
  '/contact': [91, 141, 239],
}

// Site-wide custom cursor: dot, ripple, trail, and per-page text/button glow.
function SiteCursor() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const cursorRef = useRef(null)
  const rippleRef = useRef(null)
  const trailRefs = useRef([])
  const pageAccent =
    ROUTE_ACCENT[location.pathname] || ROUTE_ACCENT['/']
  const pageAccentRef = useRef(pageAccent)
  pageAccentRef.current = pageAccent

  const glowTargetsRef = useRef([])
  const buttonRectsRef = useRef([])

  // Apply page accent to ripple/trail on mount and on every route change.
  useEffect(() => {
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

    // Walk the element stack to find the first non-transparent background.
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

    // WCAG relative luminance for picking a contrasting cursor color.
    const luminance = ([r, g, b]) => {
      const channel = (c) => {
        const s = c / 255
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
      }
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
    }

    const resolveAccent = () => pageAccentRef.current

    const GLOW_TRIGGER_RADIUS = 100

    // Shortest distance from a point to the outside of a rectangle.
    const distanceToRect = (px, py, rect) => {
      const dx = Math.max(rect.left - px, 0, px - rect.right)
      const dy = Math.max(rect.top - py, 0, py - rect.bottom)
      return Math.hypot(dx, dy)
    }

    // Update --glow-strength (and --mx/--my) on each tracked element.
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
        // Quadratic ease-in: glow ramps up slowly then accelerates.
        const strength = t * t
        target.style.setProperty('--glow-strength', strength.toFixed(3))
      }
    }

    // Hide the ripple when its 70px box overlaps any button.
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

    // Move only the leading trail dot; the rest chase via CSS delay.
    const moveTrailLeader = (x, y) => {
      const leader = trail[0]
      if (!leader) return
      leader.style.transition = 'none'
      leader.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
    }

    const handleMove = (event) => {
      const x = event.clientX
      const y = event.clientY
      // Refresh button rects each move so the overlap test stays accurate.
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

function HomePage() {
  const ref = useRef(null)
  useGsapEntrance(ref)
  return (
    <div className="hero" ref={ref} aria-label="Home">
      <PortraitImage />
      <HeroName>Madhav Dhaval Nawab</HeroName>
      <Nav links={HOME_LINKS} />
    </div>
  )
}

function AboutPage() {
  const ref = useRef(null)

  useGSAP(
    () => {
      // gsap.* calls (fromTo, set, SplitText, timeline) inside this
      // callback are auto-reverted on unmount via useGSAP's context.
      // Manual DOM mutations made outside gsap.* are NOT reverted.
      gsap.fromTo(
        '.hero-portrait',
        { autoAlpha: 0, scale: 0.92 },
        { autoAlpha: 1, scale: 1, duration: 1.1, ease: 'power3.out' }
      )
      gsap.fromTo(
        '.hero-name',
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.15 }
      )
      gsap.fromTo(
        '.hero-nav__link',
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08, delay: 0.35 }
      )

      // Per-line scramble matching https://codepen.io/GreenSock/pen/jOjaoYJ.
      const original = document.getElementById('about-paragraph-original')
      const lineSpans = document.querySelectorAll('.about-paragraph__line')
      if (original && lineSpans.length) {
        gsap.set(original, { autoAlpha: 0 })

        const split = new SplitText(original, { type: 'lines' })
        const lines = split.lines
        const tl = gsap.timeline({ delay: 0.6, defaults: { ease: 'none' } })

        lines.forEach((line, i) => {
          const target = lineSpans[i]
          if (!target) return
          const rect = line.getBoundingClientRect()
          const parentRect = original.getBoundingClientRect()
          gsap.set(target, {
            position: 'absolute',
            top: rect.top - parentRect.top,
            left: 0,
            right: 0,
            height: rect.height,
          })
          tl.to(
            target,
            {
              scrambleText: {
                text: line.textContent,
                chars: 'lowercase',
                speed: 0.5,
              },
              duration: 2.5,
            },
            i * 0.15
          )
        })
      }
    },
    { scope: ref }
  )

  return (
    <div className="hero hero--about" ref={ref} aria-label="About">
      <PortraitImage />
      <HeroName>About Me</HeroName>
      <Nav links={SUBPAGE_LINKS.filter((l) => l.to !== '/about')} />
      <div className="about-paragraph">
        <p className="about-paragraph__original" id="about-paragraph-original">
          Hello there! I am Madhav Nawab, currently a student at XYZ University, going through a Master's program. I am from Surat City in Gujarat, India. Go through the projects section if you want to glance at my work. Feel free to message me for any queries at information available on the Contact Me page.
        </p>
        <div className="about-paragraph__scramble" aria-hidden="true">
          <span className="about-paragraph__line" data-line="0" />
          <span className="about-paragraph__line" data-line="1" />
          <span className="about-paragraph__line" data-line="2" />
          <span className="about-paragraph__line" data-line="3" />
          <span className="about-paragraph__line" data-line="4" />
          <span className="about-paragraph__line" data-line="5" />
        </div>
      </div>
    </div>
  )
}

function ProjectsPage() {
  const ref = useRef(null)
  useGsapEntrance(ref)
  return (
    <div className="hero hero--projects" ref={ref} aria-label="Projects">
      <Nav links={SUBPAGE_LINKS.filter((l) => l.to !== '/projects')} />
      <HeroSubheading>My Work</HeroSubheading>
    </div>
  )
}

function ContactPage() {
  const ref = useRef(null)
  useGsapEntrance(ref)
  return (
    <div className="hero" ref={ref} aria-label="Contact">
      <PortraitImage />
      <HeroName>Contact</HeroName>
      <Nav links={SUBPAGE_LINKS.filter((l) => l.to !== '/contact')} />
    </div>
  )
}

// Re-renders on path change so the entrance effect fires for each page.
function AnimatedRoutes() {
  const location = useLocation()
  useEffect(() => {
    const slug = location.pathname === '/' ? 'home' : location.pathname.replace(/^\//, '')
    document.body.dataset.route = slug
  }, [location.pathname])
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/contact" element={<ContactPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <SiteCursor />
        <AnimatedRoutes />
      </BrowserRouter>
    </ThemeProvider>
  )
}
