import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { SplitText } from 'gsap/SplitText'
import { Observer } from 'gsap/Observer'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import './App.css'
import { ThemeProvider } from './theme-context'

gsap.registerPlugin(useGSAP, ScrambleTextPlugin, SplitText, Observer)

import linkedinIcon from './assets/linkedin.png'
import githubIcon from './assets/github.png'
import emailIcon from './assets/email.png'

// Entrance animation hook.

function useGsapEntrance( rootRef ) {
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
  '/about': [245, 158, 11],
  '/projects': [46, 204, 113],
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

  const glowTargetsRef = useRef([])
  const buttonRectsRef = useRef([])

  // Apply page accent to ripple/trail on mount and on every route change.
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
  const containerRef = useRef(null)
  useGsapEntrance(containerRef)

  // Define the number of concentric lines and the space between them
  const lineCount = 35
  const gap = 11

  const leftPaths = Array.from({ length: lineCount }).map((_, i) => {
    const r = (i + 1) * gap
    const pathLength = 1000 + Math.PI * r
    return (
      <path
        key={`l-${i}`}
        className="bg-arch-line"
        d={`M -200 ${400 - r} L 215 ${400 - r} A ${r} ${r} 0 0 1 215 ${400 + r} L -200 ${400 + r}`}
        fill="none"
        stroke="var(--muted)"
        strokeWidth="1.5" // Thickened line for better visibility
        style={{ strokeDasharray: pathLength, strokeDashoffset: pathLength, opacity: 1 }}
      />
    )
  })

  const rightPaths = Array.from({ length: lineCount }).map((_, i) => {
    const r = (i + 1) * gap
    const pathLength = 1000 + Math.PI * r
    return (
      <path
        key={`r-${i}`}
        className="bg-arch-line"
        d={`M 1400 ${400 - r} L 985 ${400 - r} A ${r} ${r} 0 0 0 985 ${400 + r} L 1400 ${400 + r}`}
        fill="none"
        stroke="var(--muted)"
        strokeWidth="1.5" // Thickened line for better visibility
        style={{ strokeDasharray: pathLength, strokeDashoffset: pathLength, opacity: 1 }}
      />
    )
  })

  useGSAP(() => {
    // 1. Use a timeline so animations run sequentially without overlapping stutters
    const tl = gsap.timeline()

    // 2. Quick, smooth draw-in animation
    tl.to('.bg-arch-line', {
      strokeDashoffset: 0,
      duration: 1.5,
      ease: 'power2.inOut',
      stagger: {
        amount: 0.6, // Quicker stagger
        from: 'center'
      }
    })

    // 3. Continuous ambient breathing effect (starts after drawing finishes)
    tl.to('.bg-arch-line', {
      opacity: 0.4, // Keeps lines much more visible at their dimmest point
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      stagger: {
        amount: 1.5,
        from: 'center'
      }
    }, "+=0.2") // Adds a tiny pause before breathing begins
  }, { scope: containerRef })

  return (
    <div className="hero" ref={containerRef} aria-label="Home" style={{ position: 'relative' }}>

      {/* Background SVG Graphic */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.75 // Substantially increased opacity to remove the dullness
      }}>
        <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          {leftPaths}
          {rightPaths}
        </svg>
      </div>

      <PortraitImage />
      <HeroName>Madhav Dhaval Nawab</HeroName>
      <Nav links={HOME_LINKS} />
    </div>
  )
}

function AboutPage() {
  const ref = useRef(null)

  useGSAP(
    (context, contextSafe) => {
      // 1. Existing Entrance Animations
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

      // 2. Synchronized Scramble Text with Overlap Fix & Font Load Wait
      const original = document.getElementById('about-paragraph-original')
      const scrambleContainer = document.querySelector('.about-paragraph__scramble')

      if (original && scrambleContainer) {
        gsap.set(original, { autoAlpha: 0 })
        gsap.set(scrambleContainer, { autoAlpha: 1 })

        // Wait for custom fonts to load so SplitText calculates widths perfectly
        document.fonts.ready.then(contextSafe(() => {
          const split = new SplitText(original, { type: 'lines' })
          const lines = split.lines

          // Dynamically create the exact number of absolute spans needed
          scrambleContainer.innerHTML = ''
          const lineSpans = lines.map(() => {
            const span = document.createElement('span')
            span.className = 'about-paragraph__line'
            scrambleContainer.appendChild(span)
            return span
          })

          const tl = gsap.timeline({
            delay: 0.2,
            defaults: { ease: 'none' },
            onComplete: () => {
              gsap.set(scrambleContainer, { autoAlpha: 0 })
              gsap.set(original, { autoAlpha: 1 })
            }
          })

          lines.forEach((line, i) => {
            const target = lineSpans[i]
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
                duration: 1.5,
              },
              i * 0.05
            )
          })
        }))
      }

      // 3. Static Neural Network Graphic (Load-in Only)
      const bgTl = gsap.timeline({ delay: 0.2 })

      // Draw the connecting data edges in
      bgTl.fromTo('.about-edge',
        { strokeDasharray: 1200, strokeDashoffset: 1200 },
        { strokeDashoffset: 0, duration: 1.5, ease: 'power3.inOut', stagger: 0.05 }
      )

      // Scale and pop the nodes into place, then stop completely
      bgTl.fromTo('.about-node',
        { scale: 0, autoAlpha: 0, transformOrigin: 'center center' },
        { scale: 1, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.5)', stagger: 0.03 },
        "-=0.8"
      )

    },
    { scope: ref }
  )

  return (
    <div className="hero hero--about" ref={ref} aria-label="About" style={{ position: 'relative' }}>

      {/* Golden Neural Constellation Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.25
      }}>
        <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
          <g className="about-network-group" fill="#F59E0B" stroke="#F59E0B">
            <path className="about-edge" d="M 150 200 L 450 150" strokeWidth="1" fill="none" />
            <path className="about-edge" d="M 450 150 L 800 250" strokeWidth="1" fill="none" />
            <path className="about-edge" d="M 150 200 L 300 500" strokeWidth="1" fill="none" />
            <path className="about-edge" d="M 450 150 L 600 450" strokeWidth="1" fill="none" />
            <path className="about-edge" d="M 800 250 L 600 450" strokeWidth="1" fill="none" />
            <path className="about-edge" d="M 800 250 L 900 600" strokeWidth="1" fill="none" />
            <path className="about-edge" d="M 300 500 L 600 450" strokeWidth="1" fill="none" />
            <path className="about-edge" d="M 300 500 L 250 800" strokeWidth="1" fill="none" />
            <path className="about-edge" d="M 600 450 L 550 750" strokeWidth="1" fill="none" />
            <path className="about-edge" d="M 900 600 L 550 750" strokeWidth="1" fill="none" />
            <path className="about-edge" d="M 900 600 L 850 850" strokeWidth="1" fill="none" />
            <path className="about-edge" d="M 550 750 L 850 850" strokeWidth="1" fill="none" />
            <path className="about-edge" d="M 250 800 L 550 750" strokeWidth="1" fill="none" />

            <circle className="about-node" cx="150" cy="200" r="4" />
            <circle className="about-node" cx="450" cy="150" r="6" />
            <circle className="about-node" cx="800" cy="250" r="5" />
            <circle className="about-node" cx="300" cy="500" r="7" />
            <circle className="about-node" cx="600" cy="450" r="8" />
            <circle className="about-node" cx="900" cy="600" r="5" />
            <circle className="about-node" cx="250" cy="800" r="6" />
            <circle className="about-node" cx="550" cy="750" r="7" />
            <circle className="about-node" cx="850" cy="850" r="4" />
          </g>
        </svg>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <PortraitImage />
        <HeroName>About Me</HeroName>
        <Nav links={SUBPAGE_LINKS.filter((l) => l.to !== '/about')} />
      </div>

      <div className="about-paragraph" style={{ position: 'relative', zIndex: 1 }}>
        <p className="about-paragraph__original" id="about-paragraph-original">
          Hello there! I am Madhav Nawab, currently a student at XYZ University, going through a Master's program. I am from Surat City in Gujarat, India. Go through the projects section if you want to glance at my work. Feel free to message me for any queries at information available on the Contact Me page.
        </p>
        <div className="about-paragraph__scramble" aria-hidden="true">
          {/* Spans are now injected dynamically by GSAP after fonts load */}
        </div>
      </div>
    </div>
  )
}


function ProjectsPage() {
  const containerRef = useRef(null)
  const scrollOffsetRef = useRef(0)
  const isSnappingRef = useRef(false)
  const snapTimeoutRef = useRef(null)

  const items = [
    { title: 'E-Commerce Platform', url: 'https://github.com' },
    { title: 'Portfolio V1', url: 'https://github.com' },
    { title: 'WebGL Experience', url: 'https://github.com' },
    { title: 'Dashboard UI', url: 'https://github.com' },
    { title: 'Social Clone', url: 'https://github.com' },
    { title: 'Mobile App Design', url: 'https://github.com' }
  ]

  useGSAP((context, contextSafe) => {
    gsap.fromTo(
      '.hero-nav__link',
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08, delay: 0.35 }
    )
    gsap.fromTo(
      '.hero-name',
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.15 }
    )
    gsap.fromTo(
      '.fullscreen-graphic',
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 2, ease: 'power2.out', delay: 0.5 }
    )

    const DOMitems = gsap.utils.toArray('.carousel-item')
    if (DOMitems.length === 0) return

    const itemHeight = 80
    const wrapHeight = DOMitems.length * itemHeight
    const wrapY = gsap.utils.wrap(-itemHeight, wrapHeight - itemHeight)

    const updatePositions = (offset) => {
      DOMitems.forEach((el, i) => {
        const rawY = (i * itemHeight) + offset
        gsap.set(el, { y: wrapY(rawY) })
      })
    }

    // Initial setup
    updatePositions(0)

    Observer.create({
      target: containerRef.current,
      type: 'wheel,touch',
      onChange: contextSafe((self) => {
        if (isSnappingRef.current) return

        // Accumulate scroll offset for smooth momentum/trackpad scrolling
        scrollOffsetRef.current -= self.deltaY * 0.7
        updatePositions(scrollOffsetRef.current)

        // Clear existing snap timeout and wait for scrolling to pause
        clearTimeout(snapTimeoutRef.current)
        snapTimeoutRef.current = setTimeout(() => {
          isSnappingRef.current = true

          // Calculate the nearest item snap point
          const nearestSnap = Math.round(scrollOffsetRef.current / itemHeight) * itemHeight

          const proxy = { val: scrollOffsetRef.current }
          gsap.to(proxy, {
            val: nearestSnap,
            duration: 0.6,
            ease: 'power3.out',
            onUpdate: () => {
              scrollOffsetRef.current = proxy.val
              updatePositions(scrollOffsetRef.current)
            },
            onComplete: () => {
              isSnappingRef.current = false
            }
          })
        }, 150) // Triggers auto-snap 150ms after scroll input stops
      }),
      preventDefault: true,
    })
  }, { scope: containerRef })

  return (
    <div className="hero hero--projects" ref={containerRef} aria-label="Projects" style={{ position: 'relative' }}>

      {/* Fullscreen Architectural Background Graphic */}
      <div className="fullscreen-graphic" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.2
      }}>
        <svg width="100%" height="100%" preserveAspectRatio="none">
          <line x1="15%" y1="0" x2="15%" y2="100%" stroke="#ffffff" strokeWidth="0.5" opacity="0.4" />
          <line x1="40%" y1="0" x2="40%" y2="100%" stroke="#2ecc71" strokeWidth="1" opacity="0.7" />
          <line x1="75%" y1="0" x2="75%" y2="100%" stroke="#ffffff" strokeWidth="0.5" opacity="0.3" />
          <line x1="85%" y1="0" x2="85%" y2="100%" stroke="#ffffff" strokeWidth="2" opacity="0.15" />

          <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#ffffff" strokeWidth="0.5" opacity="0.4" />
          <line x1="0" y1="65%" x2="100%" y2="65%" stroke="#ffffff" strokeWidth="1" opacity="0.2" />
          <line x1="0" y1="85%" x2="100%" y2="85%" stroke="#2ecc71" strokeWidth="0.5" opacity="0.6" />

          <line x1="0" y1="100%" x2="100%" y2="0" stroke="#2ecc71" strokeWidth="1.5" opacity="0.5" />
          <line x1="0" y1="10%" x2="100%" y2="100%" stroke="#ffffff" strokeWidth="0.5" opacity="0.2" />

          <circle cx="40%" cy="25%" r="4" fill="#2ecc71" opacity="0.9" />
          <circle cx="15%" cy="65%" r="3" fill="#ffffff" opacity="0.6" />
          <circle cx="75%" cy="85%" r="3" fill="#ffffff" opacity="0.6" />
        </svg>
      </div>

      <Nav links={SUBPAGE_LINKS.filter((l) => l.to !== '/projects')} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(250px, 40%) 1fr',
        gap: '2vw',
        width: '100%',
        alignSelf: 'stretch',
        flex: 1,
        alignContent: 'center',
        padding: '0 8vw',
        zIndex: 1
      }}>

        {/* Left Side: Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          textAlign: 'right'
        }}>
          <div style={{ transform: 'scale(1.25)', transformOrigin: 'right center' }}>
            <HeroSubheading>My Work</HeroSubheading>
          </div>
        </div>

        {/* Right Side: Carousel Mask with Auto-Snap */}
        <div className="carousel-wrapper" style={{
          position: 'relative',
          width: '100%',
          height: '240px',
          overflow: 'hidden',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)'
        }}>
          {items.map((item, i) => (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="carousel-item"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '80px',
                lineHeight: '80px',
                fontSize: 'clamp(1.8rem, 4vw, 3.5rem)',
                color: 'var(--muted)',
                fontWeight: 600,
                textAlign: 'left',
                whiteSpace: 'nowrap',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
                display: 'block'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted)' }}
            >
              {item.title}
            </a>
          ))}
        </div>

      </div>
    </div>
  )
}

function ContactPage() {
  const ref = useRef(null)
  useGsapEntrance(ref)

  const { contextSafe } = useGSAP(() => {
    gsap.from(".contact-card", {
      y: 20,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: "power2.out",
      delay: 0.2
    })
  }, { scope: ref })

  const handleMouseEnter = contextSafe((index, element) => {
    const cards = gsap.utils.toArray(".contact-card")

    // Expand the hovered card
    gsap.to(element, {
      flex: 3,
      maxWidth: 600,
      duration: 0.5,
      ease: "power2.out",
    })
    element.classList.add('expanded')

    // Shrink others
    cards.forEach((card, i) => {
      if (i !== index) {
        gsap.to(card, {
          flex: 1,
          maxWidth: 200,
          duration: 0.5,
          ease: "power2.out",
        })
        card.classList.remove('expanded')
      }
    })
  })

  const handleMouseLeave = contextSafe(() => {
    const cards = gsap.utils.toArray(".contact-card")
    gsap.to(cards, {
      flex: 1,
      maxWidth: 250,
      duration: 0.5,
      ease: "power2.inOut",
    })
    cards.forEach(c => c.classList.remove('expanded'))
  })

  const contactLinks = [
    { label: 'LinkedIn', url: 'http://www.linkedin.com/in/madhav-nawab', icon: linkedinIcon, username: '@madhav-nawab' },
    { label: 'GitHub', url: 'https://github.com/madman-10', icon: githubIcon, username: 'madman-10' },
    { label: 'Email', url: 'mailto:mdnawab001@gmail.com', icon: emailIcon, username: 'Madhav Dhaval Nawab' },
  ]

  return (
    <div className="hero hero--contact" ref={ref} aria-label="Contact">
      <Nav links={SUBPAGE_LINKS.filter((l) => l.to !== '/contact')} />
      <HeroName>Contact</HeroName>

      <div className="contact-card-container">
        {contactLinks.map((link, i) => (
          <a
            key={i}
            href={link.url}
            className="contact-card"
            onMouseEnter={(e) => handleMouseEnter(i, e.currentTarget)}
            onMouseLeave={handleMouseLeave}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="contact-card__content">
              {typeof link.icon === 'string' && link.icon.startsWith('data') || (typeof link.icon === 'object' || (typeof link.icon === 'string' && link.icon.includes('.'))) ? (
                <img src={link.icon} alt={link.label} className="contact-card__icon" />
              ) : (
                <span className="contact-card__icon">{link.icon}</span>
              )}
              <span className="contact-card__label">{link.username}</span>
            </div>
          </a>
        ))}
      </div>
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
