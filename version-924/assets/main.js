(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');
    if (menuButton && mobileMenu) {
      menuButton.addEventListener('click', function () {
        mobileMenu.classList.toggle('is-open');
      });
    }

    var backTop = document.querySelector('[data-back-top]');
    if (backTop) {
      window.addEventListener('scroll', function () {
        if (window.pageYOffset > 300) {
          backTop.classList.add('is-visible');
        } else {
          backTop.classList.remove('is-visible');
        }
      });
      backTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    var sliders = document.querySelectorAll('[data-hero-slider]');
    sliders.forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
      if (!slides.length) {
        return;
      }
      var current = 0;
      function setSlide(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          setSlide(index);
        });
      });
      setSlide(0);
      window.setInterval(function () {
        setSlide(current + 1);
      }, 5000);
    });

    var filterInputs = document.querySelectorAll('[data-card-filter]');
    filterInputs.forEach(function (input) {
      var targetSelector = input.getAttribute('data-card-filter');
      var cards = Array.prototype.slice.call(document.querySelectorAll(targetSelector));
      input.addEventListener('input', function () {
        var query = normalize(input.value);
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search-text'));
          card.style.display = !query || text.indexOf(query) !== -1 ? '' : 'none';
        });
      });
    });

    var resultRoot = document.querySelector('[data-search-results]');
    if (resultRoot && typeof MOVIE_SEARCH_INDEX !== 'undefined') {
      var params = new URLSearchParams(window.location.search);
      var query = normalize(params.get('q'));
      var input = document.querySelector('[data-search-input]');
      if (input && query) {
        input.value = params.get('q');
      }
      var list = MOVIE_SEARCH_INDEX;
      var matches = query
        ? list.filter(function (item) {
            return normalize(item.title + ' ' + item.year + ' ' + item.region + ' ' + item.category + ' ' + item.genre + ' ' + item.tags + ' ' + item.oneLine).indexOf(query) !== -1;
          })
        : list.slice(0, 48);
      resultRoot.innerHTML = matches.slice(0, 120).map(function (item) {
        return [
          '<a class="movie-card" href="' + item.href + '" data-search-text="' + item.title.replace(/"/g, '&quot;') + '">',
          '  <div class="poster-wrap">',
          '    <img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy">',
          '    <div class="card-overlay"><p>' + item.oneLine + '</p></div>',
          '    <div class="badge-row"><span class="badge year">' + item.year + '</span></div>',
          '    <span class="play-badge">▶</span>',
          '  </div>',
          '  <div class="card-body">',
          '    <h3>' + item.title + '</h3>',
          '    <div class="card-meta"><span>' + item.region + '</span><span>' + item.type + '</span></div>',
          '    <div class="tag-line"><span>' + item.category + '</span></div>',
          '  </div>',
          '</a>'
        ].join('');
      }).join('');
    }
  });
})();
