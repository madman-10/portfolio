import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import HeroName from '../components/HeroName'
import linkedinIcon from '../assets/linkedin.png'
import githubIcon from '../assets/github.png'
import emailIcon from '../assets/email.png'

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

export default function ContactPage() {
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

    gsap.to(element, {
      flex: 3,
      maxWidth: 600,
      duration: 0.5,
      ease: "power2.out",
    })
    element.classList.add('expanded')

    const label = element.querySelector('.contact-card__label')
    if (label) {
      gsap.to(label, { opacity: 1, duration: 0.3, delay: 0.2 })
    }

    cards.forEach((card, i) => {
      if (i !== index) {
        gsap.to(card, {
          flex: 1,
          maxWidth: 200,
          duration: 0.5,
          ease: "power2.out",
        })
        card.classList.remove('expanded')

        const otherLabel = card.querySelector('.contact-card__label')
        if (otherLabel) {
          gsap.to(otherLabel, { opacity: 0, duration: 0.2 })
        }
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
    cards.forEach(c => {
      c.classList.remove('expanded')
      const label = c.querySelector('.contact-card__label')
      if (label) {
        gsap.to(label, { opacity: 0, duration: 0.3 })
      }
    })
  })

  const contactLinks = [
    { label: 'LinkedIn', url: 'http://www.linkedin.com/in/madhav-nawab', icon: linkedinIcon, username: '@madhav-nawab' },
    { label: 'GitHub', url: 'https://github.com/madman-10', icon: githubIcon, username: 'madman-10' },
    { label: 'Email', url: 'mailto:mdnawab001@gmail.com', icon: emailIcon, username: 'Madhav Dhaval Nawab' },
  ]

  return (
    <div className="hero hero--contact" ref={ref} aria-label="Contact">
      <Nav links={[
        { to: '/', label: 'Home' },
        { to: '/about', label: 'About' },
        { to: '/projects', label: 'Projects' },
      ]} />
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
            <div className="contact-card__content" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              position: 'relative',
              boxSizing: 'border-box',
            }}>
              <div className="contact-card__inner-content" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // gap: '12px',
                position: 'relative',
                width: 'fit-content',
                height: 'fit-content',
              }}>
                <div className="contact-card__icon-wrapper" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 2,
                  flexShrink: 0
                }}>
                  {typeof link.icon === 'string' && link.icon.startsWith('data') || (typeof link.icon === 'object' || (typeof link.icon === 'string' && link.icon.includes('.'))) ? (
                    <img src={link.icon} alt={link.label} className="contact-card__icon" style={{
                      display: 'block',
                      flexShrink: 0,
                      objectFit: 'contain'
                    }} />
                  ) : (
                    <span className="contact-card__icon" style={{ flexShrink: 0 }}>{link.icon}</span>
                  )}
                </div>
                <span className="contact-card__label" style={{
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  zIndex: 1,
                  display: 'inline-block'
                }}>{link.username}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
