import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { SplitText } from 'gsap/SplitText'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import HeroName from '../components/HeroName'
import PortraitImage from '../components/PortraitImage'

gsap.registerPlugin(useGSAP, ScrambleTextPlugin, SplitText)

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

export default function AboutPage() {
  const ref = useRef(null)
  useGsapEntrance(ref)

  useGSAP(
    (context, contextSafe) => {
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

      const original = document.getElementById('about-paragraph-original')
      const scrambleContainer = document.querySelector('.about-paragraph__scramble')

      if (original && scrambleContainer) {
        gsap.set(original, { autoAlpha: 0 })
        gsap.set(scrambleContainer, { autoAlpha: 1 })

        document.fonts.ready.then(contextSafe(() => {
          const split = new SplitText(original, { type: 'lines' })
          const lines = split.lines
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

      const bgTl = gsap.timeline({ delay: 0.2 })
      bgTl.fromTo('.about-edge',
        { strokeDasharray: 1200, strokeDashoffset: 1200 },
        { strokeDashoffset: 0, duration: 1.5, ease: 'power3.inOut', stagger: 0.05 }
      )
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
        <Nav links={[
          { to: '/', label: 'Home' },
          { to: '/projects', label: 'Projects' },
          { to: '/contact', label: 'Contact' },
        ]} />
      </div>
      <div className="about-paragraph" style={{ position: 'relative', zIndex: 1 }}>
        <p className="about-paragraph__original" id="about-paragraph-original">
          Hello there! I am Madhav Nawab, currently a student at XYZ University, going through a Master's program. I am from Surat City in Gujarat, India. Go through the projects section if you want to glance at my work. Feel free to message me for any queries at information available on the Contact Me page.
        </p>
        <div className="about-paragraph__scramble" aria-hidden="true">
        </div>
      </div>
    </div>
  )
}
