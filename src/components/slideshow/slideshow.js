/**
 * Slideshow component
 * Initializes Glider.js carousel with autoplay support.
 */
/* global Glider */
document.querySelectorAll('.slideshow').forEach(function (section) {
  const viewport = section.querySelector('.slideshow__viewport');
  const track = section.querySelector('.slideshow__track');
  const dotsEl = section.querySelector('[data-dots]');
  const prevArrow = section.querySelector('[data-arrow="prev"]');
  const nextArrow = section.querySelector('[data-arrow="next"]');
  const autoplay = section.dataset.autoplay === 'true';
  const autoplaySpeed = (parseInt(section.dataset.autoplaySpeed, 10) || 5) * 1000;

  if (!viewport || !track || track.children.length === 0) return;

  // Wait for Glider.js to load (deferred script)
  function initWhenReady() {
    if (typeof window.Glider === 'undefined') {
      setTimeout(initWhenReady, 50);
      return;
    }

    const glider = new Glider(viewport, {
      slidesToShow: 1,
      slidesToScroll: 1,
      scrollLock: true,
      skipTrack: true,
      dots: dotsEl,
      arrows: {
        prev: prevArrow,
        next: nextArrow
      },
      draggable: true,
      rewind: true
    });

    // Autoplay
    if (autoplay && track.children.length > 1) {
      let timer = null;

      function startAutoplay() {
        stopAutoplay();
        timer = setInterval(function () {
          glider.scrollItem('next');
        }, autoplaySpeed);
      }

      function stopAutoplay() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }

      startAutoplay();

      // Pause on hover/focus
      section.addEventListener('mouseenter', stopAutoplay);
      section.addEventListener('focusin', stopAutoplay);
      section.addEventListener('mouseleave', startAutoplay);
      section.addEventListener('focusout', startAutoplay);
    }
  }

  initWhenReady();
});
