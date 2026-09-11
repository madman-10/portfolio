import React from 'react'

export default function PortraitImage() {
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
