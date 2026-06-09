(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;
  var heroTimer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === heroIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === heroIndex);
    });
  }

  function startHero() {
    if (heroTimer) {
      window.clearInterval(heroTimer);
    }

    if (slides.length > 1) {
      heroTimer = window.setInterval(function () {
        showHero(heroIndex + 1);
      }, 5200);
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showHero(index);
      startHero();
    });
  });

  showHero(0);
  startHero();

  var searchInput = document.querySelector('[data-movie-search]');
  var filterSelects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card[data-search]'));

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    var query = normalize(searchInput ? searchInput.value : '');
    var activeFilters = {};

    filterSelects.forEach(function (select) {
      if (select.value) {
        activeFilters[select.getAttribute('data-filter-select')] = select.value;
      }
    });

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search') || card.textContent);
      var matched = !query || text.indexOf(query) !== -1;

      Object.keys(activeFilters).forEach(function (key) {
        if ((card.getAttribute('data-' + key) || '') !== activeFilters[key]) {
          matched = false;
        }
      });

      card.classList.toggle('is-hidden', !matched);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  filterSelects.forEach(function (select) {
    select.addEventListener('change', applyFilters);
  });

  window.initializeStaticPlayer = function (source) {
    var video = document.getElementById('movie-video');
    var cover = document.getElementById('play-toggle');
    var started = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (started) {
        return Promise.resolve();
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        return Promise.resolve();
      }

      video.src = source;
      return Promise.resolve();
    }

    function beginPlay() {
      attachSource().then(function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }

        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      });
    }

    if (cover) {
      cover.addEventListener('click', beginPlay);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        beginPlay();
      }
    });

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
