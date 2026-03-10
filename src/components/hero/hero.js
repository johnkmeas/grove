/**
 * Hero component — Vanilla ES module
 *
 * Handles:
 * - Video autoplay management (respects prefers-reduced-motion)
 * - Lazy-initialise on IntersectionObserver
 */

class HeroSection {
  constructor(el) {
    this.el = el
    this.video = el.querySelector('.hero__video')
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    this.init()
  }

  init() {
    if (this.video) {
      this.initVideo()
    }
  }

  initVideo() {
    if (this.prefersReducedMotion) {
      this.video.pause()
      this.video.removeAttribute('autoplay')
      return
    }

    // Ensure video plays when visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.video.play().catch(() => {
              // Autoplay blocked — fail silently, poster image shows
            })
          } else {
            this.video.pause()
          }
        })
      },
      { threshold: 0.25 },
    )

    observer.observe(this.el)
  }
}

// Auto-initialise all hero sections on the page
document.querySelectorAll('.hero').forEach((el) => {
  new HeroSection(el)
})

console.log('test hero.js')
