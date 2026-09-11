import React from 'react'

export default function HeroSubheading({ children }) {
  return (
    <h2 className="hero-name hero-name--sub" data-text={children} tabIndex={0}>
      {children}
    </h2>
  )
}
