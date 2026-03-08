/**
 * Grove Theme — Global JS entry point
 * Imports global styles and initialises core utilities.
 * Component-specific JS is loaded per component.
 */

import './theme.scss'

// Accessibility: manage focus on navigation
document.addEventListener('DOMContentLoaded', () => {
  // Remove focus outline from mouse clicks, keep for keyboard
  document.body.addEventListener('mousedown', () => {
    document.body.classList.add('using-mouse')
  })
  document.body.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.remove('using-mouse')
    }
  })
})
