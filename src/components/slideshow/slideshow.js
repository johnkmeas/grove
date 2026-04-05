/**
 * Slideshow component
 * Initializes Glider.js carousel with autoplay support.
 */
document.querySelectorAll('.slideshow').forEach(function (section) {
  var viewport = section.querySelector('.slideshow__viewport');
  var track = section.querySelector('.slideshow__track');
  var dotsEl = section.querySelector('[data-dots]');
  var prevArrow = section.querySelector('[data-arrow="prev"]');
  var nextArrow = section.querySelector('[data-arrow="next"]');
  var autoplay = section.dataset.autoplay === 'true';
  var autoplaySpeed = (parseInt(section.dataset.autoplaySpeed, 10) || 5) * 1000;

  if (!viewport || !track || track.children.length === 0) return;

  // Wait for Glider.js to load (deferred script)
  function initWhenReady() {
    if (typeof window.Glider === 'undefined') {
      setTimeout(initWhenReady, 50);
      return;
    }

    var glider = new Glider(viewport, {
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
      var timer = null;

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
