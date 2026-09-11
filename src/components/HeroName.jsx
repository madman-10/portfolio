import React from 'react'

export default function HeroName({ children }) {
  return (
    <h1 className="hero-name" data-text={children} tabIndex={0}>
      {children}
    </h1>
  )
}
