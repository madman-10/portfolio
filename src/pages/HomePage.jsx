import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import HeroName from '../components/HeroName'

function useGsapEntrance( rootRef ) {
  useGSAP(
    () => {
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

export default function HomePage() {
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
        strokeWidth="1.5"
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
        strokeWidth="1.5"
        style={{ strokeDasharray: pathLength, strokeDashoffset: pathLength, opacity: 1 }}
      />
    )
  })

  useGSAP(() => {
    const tl = gsap.timeline()
    tl.to('.bg-arch-line', {
      strokeDashoffset: 0,
      duration: 1.5,
      ease: 'power2.inOut',
      stagger: {
        amount: 0.6,
        from: 'center'
      }
    })
    tl.to('.bg-arch-line', {
      opacity: 0.4,
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      stagger: {
        amount: 1.5,
        from: 'center'
      }
    }, "+=0.2")
  }, { scope: containerRef })

  return (
    <div className="hero" ref={containerRef} aria-label="Home" style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.75
      }}>
        <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          {leftPaths}
          {rightPaths}
        </svg>
      </div>
      <HeroName>Madhav Dhaval Nawab</HeroName>
      <Nav links={[
        { to: '/about', label: 'About' },
        { to: '/projects', label: 'Projects' },
        { to: '/contact', label: 'Contact' },
      ]} />
    </div>
  )
}
