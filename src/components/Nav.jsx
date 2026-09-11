import React from 'react'
import { Link } from 'react-router-dom'

export default function Nav({ links }) {
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
