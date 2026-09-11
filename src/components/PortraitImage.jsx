import React from 'react'
import portraitImg from '../assets/self_standby_image.jpg'

export default function PortraitImage() {
  return (
    <div
      className="hero-portrait"
      aria-label="Profile photo"
      style={{
        backgroundImage: `url(${portraitImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  )
}
