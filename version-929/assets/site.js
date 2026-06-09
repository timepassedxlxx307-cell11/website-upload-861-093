(function() {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initNavigation() {
    var button = $(".mobile-menu-button");
    var menu = $(".mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function() {
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      menu.hidden = expanded;
    });
  }

  function initHero() {
    var slider = $(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = $all(".hero-slide", slider);
    var dots = $all(".hero-dot", slider);
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    dots.forEach(function(dot, index) {
      dot.addEventListener("click", function() {
        show(index);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function() {
        show(current + 1);
      }, 5200);
    }
  }

  function applyCardFilter(root, inputSelector, emptySelector) {
    var input = $(inputSelector, root);
    var cards = $all(".search-card", root);
    var empty = $(emptySelector, root);
    if (!input || cards.length === 0) {
      return;
    }
    function run() {
      var query = normalize(input.value);
      var visible = 0;
      cards.forEach(function(card) {
        var haystack = normalize(card.getAttribute("data-keywords") + " " + card.getAttribute("data-title"));
        var matched = !query || haystack.indexOf(query) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }
    input.addEventListener("input", run);
    run();
  }

  function initSearchPage() {
    var root = $("[data-search-page]");
    if (!root) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var input = $("#searchInput", root);
    if (input && params.get("q")) {
      input.value = params.get("q");
    }
    applyCardFilter(root, "#searchInput", ".search-empty");
  }

  function initCategoryPage() {
    var root = $("[data-category-page]");
    if (!root) {
      return;
    }
    applyCardFilter(root, "#categoryFilter", ".search-empty");
    var sort = $("#categorySort", root);
    var grid = $(".movie-grid", root);
    if (!sort || !grid) {
      return;
    }
    sort.addEventListener("change", function() {
      var cards = $all(".movie-card", grid);
      cards.sort(function(a, b) {
        if (sort.value === "title") {
          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-CN");
        }
        if (sort.value === "year") {
          return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
        }
        return 0;
      });
      cards.forEach(function(card) {
        grid.appendChild(card);
      });
    });
  }

  window.initMoviePlayer = function(videoId, overlayId, sourceUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var hlsInstance = null;
    var attached = false;
    if (!video || !sourceUrl) {
      return;
    }
    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }
    function start() {
      attach();
      video.controls = true;
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function() {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }
    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function() {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener("beforeunload", function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function() {
    initNavigation();
    initHero();
    initSearchPage();
    initCategoryPage();
  });
})();
