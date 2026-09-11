import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { Observer } from 'gsap/Observer'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import HeroSubheading from '../components/HeroSubheading'

// Register Observer to avoid "Cannot read properties of undefined (reading 'core')" error
gsap.registerPlugin(Observer)

export default function ProjectsPage() {
// ...
  const containerRef = useRef(null)
  const scrollOffsetRef = useRef(0)
  const isSnappingRef = useRef(false)
  const snapTimeoutRef = useRef(null)

  const items = [
    { title: 'Web To-Do List', url: 'https://madman-10.github.io/to-do-web/' },
    { title: 'Color Palette Generator', url: 'color-palete-gen.vercel.app' },
    { title: 'Guess Game', url: 'guess-game-black-nine.vercel.app' },
    { title: 'Auto File Courier', url: 'https://github.com/madman-10/auto-file-courier' },
    { title: 'Pomodoro Timer', url: 'https://pomodorotimerwebapp.streamlit.app/' },
    { title: 'International Football Prediction', url: 'https://international-football-prediction.vercel.app/' }
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

    updatePositions(0)

    Observer.create({
      target: containerRef.current,
      type: 'wheel,touch',
      onChange: contextSafe((self) => {
        if (isSnappingRef.current) return
        scrollOffsetRef.current -= self.deltaY * 0.7
        updatePositions(scrollOffsetRef.current)

        clearTimeout(snapTimeoutRef.current)
        snapTimeoutRef.current = setTimeout(() => {
          isSnappingRef.current = true
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
        }, 150)
      }),
      preventDefault: true,
    })
  }, { scope: containerRef })

  return (
    <div className="hero hero--projects" ref={containerRef} aria-label="Projects" style={{ position: 'relative' }}>
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
          <line x1="0" y1="85%" x2="100%" y2="85%" stroke="#ffffff" strokeWidth="0.5" opacity="0.6" />
          <line x1="0" y1="100%" x2="100%" y2="0" stroke="#2ecc71" strokeWidth="1.5" opacity="0.5" />
          <line x1="0" y1="10%" x2="100%" y2="100%" stroke="#ffffff" strokeWidth="0.5" opacity="0.2" />
          <circle cx="40%" cy="25%" r="4" fill="#2ecc71" opacity="0.9" />
          <circle cx="15%" cy="65%" r="3" fill="#ffffff" opacity="0.6" />
          <circle cx="75%" cy="85%" r="3" fill="#ffffff" opacity="0.6" />
        </svg>
      </div>
      <Nav links={[
        { to: '/', label: 'Home' },
        { to: '/about', label: 'About' },
        { to: '/contact', label: 'Contact' },
      ]} />
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
