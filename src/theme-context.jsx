import { createContext, useEffect, useState } from 'react'

const ThemeContext = createContext()
export { ThemeContext }

const INITIAL_THEME = (() => {
  if (typeof window === 'undefined') return 'dark'
  const saved = window.localStorage.getItem('theme')
  return saved === 'light' || saved === 'dark' ? saved : 'dark'
})()

// Theme provider: persists the chosen theme to localStorage and applies it to <html>.
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(INITIAL_THEME)

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('color-scheme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const setLightTheme = () => setTheme('light')
  const setDarkTheme = () => setTheme('dark')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setLightTheme, setDarkTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
