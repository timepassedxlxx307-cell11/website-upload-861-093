(function () {
  function all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function one(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function initMobileMenu() {
    var toggle = one('[data-mobile-toggle]');
    var menu = one('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initSearchForms() {
    all('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = one('input[name="q"]', form);
        var query = input ? input.value.trim() : '';
        if (query) {
          window.location.href = 'search.html?q=' + encodeURIComponent(query);
        } else {
          window.location.href = 'search.html';
        }
      });
    });
  }

  function initHero() {
    var hero = one('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = all('[data-hero-slide]', hero);
    var dots = all('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5000);
  }

  function initLocalFilter() {
    var input = one('[data-filter-input]');
    var grid = one('[data-sort-grid]');
    if (!input || !grid) {
      return;
    }
    var cards = all('.movie-card', grid);
    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        card.hidden = query && text.indexOf(query) === -1;
      });
    });
  }

  function initSort() {
    var select = one('[data-sort-select]');
    var grid = one('[data-sort-grid]');
    if (!select || !grid) {
      return;
    }
    var original = all('.movie-card', grid);
    select.addEventListener('change', function () {
      var value = select.value;
      var cards = original.slice();
      if (value === 'year-desc') {
        cards.sort(function (a, b) {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        });
      }
      if (value === 'year-asc') {
        cards.sort(function (a, b) {
          return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
        });
      }
      if (value === 'title-asc') {
        cards.sort(function (a, b) {
          return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-CN');
        });
      }
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
    });
  }

  function initPlayer() {
    var video = one('#player-video');
    var button = one('[data-play-button]');
    if (!video) {
      return;
    }
    var prepared = false;
    function prepare() {
      if (prepared) {
        return;
      }
      var source = video.getAttribute('data-video-url');
      if (!source) {
        return;
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hlsPlayer = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsPlayer.loadSource(source);
        hlsPlayer.attachMedia(video);
      } else {
        video.src = source;
      }
    }
    function start() {
      prepare();
      if (button) {
        button.hidden = true;
      }
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
      }
    }
    if (button) {
      button.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      if (button) {
        button.hidden = true;
      }
    });
  }

  function initBackTop() {
    var button = one('[data-back-top]');
    if (!button) {
      return;
    }
    function update() {
      button.classList.toggle('is-visible', window.scrollY > 420);
    }
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card">' +
      '<a class="poster-link" href="' + escapeHtml(item.link) + '">' +
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
      '<span class="poster-gradient"></span>' +
      '<span class="badge year">' + escapeHtml(item.year) + '</span>' +
      '<span class="play-dot">▶</span>' +
      '<p class="poster-copy">' + escapeHtml(item.summary) + '</p>' +
      '</a>' +
      '<div class="card-body">' +
      '<h2><a href="' + escapeHtml(item.link) + '">' + escapeHtml(item.title) + '</a></h2>' +
      '<div class="meta-row"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderSearchPage() {
    if (document.body.getAttribute('data-page') !== 'search') {
      return;
    }
    var input = one('[data-global-search]');
    var typeSelect = one('[data-global-type]');
    var results = one('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (input) {
      input.value = initialQuery;
    }
    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var items = (window.SITE_ITEMS || []).filter(function (item) {
        var haystack = [item.title, item.year, item.region, item.type, item.genre, (item.tags || []).join(' '), item.summary].join(' ').toLowerCase();
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesType = !type || String(item.type).indexOf(type) !== -1 || String(item.genre).indexOf(type) !== -1;
        return matchesQuery && matchesType;
      }).slice(0, 120);
      if (!results) {
        return;
      }
      if (!items.length) {
        results.innerHTML = '<div class="empty-state">没有找到相关影片</div>';
        return;
      }
      results.innerHTML = items.map(cardTemplate).join('');
    }
    if (input) {
      input.addEventListener('input', apply);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', apply);
    }
    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initSearchForms();
    initHero();
    initLocalFilter();
    initSort();
    initPlayer();
    initBackTop();
    renderSearchPage();
  });
})();
