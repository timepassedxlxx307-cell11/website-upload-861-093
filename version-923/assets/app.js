(() => {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileNavigation() {
    const toggle = document.querySelector(".mobile-toggle");
    const menu = document.querySelector(".mobile-nav");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.textContent = isOpen ? "×" : "☰";
    });
  }

  function setupHeroCarousel() {
    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    if (!slides.length || !dots.length) {
      return;
    }
    let active = 0;
    let timer = null;
    const show = (index) => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, current) => {
        slide.classList.toggle("is-active", current === active);
      });
      dots.forEach((dot, current) => {
        dot.classList.toggle("is-active", current === active);
      });
    };
    const start = () => {
      timer = window.setInterval(() => show(active + 1), 5200);
    };
    const restart = () => {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        show(Number(dot.getAttribute("data-slide") || "0"));
        restart();
      });
    });
    start();
  }

  function setupFiltering() {
    const inputs = Array.from(document.querySelectorAll("[data-movie-filter]"));
    if (!inputs.length) {
      return;
    }
    inputs.forEach((input) => {
      const section = input.closest("section") || document;
      const cards = Array.from(section.querySelectorAll(".movie-card"));
      const filter = () => {
        const query = input.value.trim().toLowerCase();
        cards.forEach((card) => {
          const text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-category"),
            card.getAttribute("data-keywords"),
            card.textContent
          ].join(" ").toLowerCase();
          card.classList.toggle("is-hidden", query.length > 0 && !text.includes(query));
        });
      };
      input.addEventListener("input", filter);
      const params = new URLSearchParams(window.location.search);
      const initial = params.get("q");
      if (initial) {
        input.value = initial;
        filter();
      }
    });
  }

  function setupSorting() {
    const selects = Array.from(document.querySelectorAll("[data-movie-sort]"));
    selects.forEach((select) => {
      const section = select.closest("section") || document;
      const container = section.querySelector("[data-sort-container]");
      if (!container) {
        return;
      }
      const original = Array.from(container.children);
      select.addEventListener("change", () => {
        const cards = Array.from(container.children);
        const value = select.value;
        const sorted = value === "default" ? original : cards.sort((left, right) => {
          if (value === "title") {
            return (left.getAttribute("data-title") || "").localeCompare(right.getAttribute("data-title") || "", "zh-CN");
          }
          const leftYear = Number((left.getAttribute("data-year") || "").replace(/\D/g, "")) || 0;
          const rightYear = Number((right.getAttribute("data-year") || "").replace(/\D/g, "")) || 0;
          return value === "year-asc" ? leftYear - rightYear : rightYear - leftYear;
        });
        sorted.forEach((card) => container.appendChild(card));
      });
    });
  }

  window.setupMoviePlayer = function setupMoviePlayer(options) {
    const video = document.getElementById(options.videoId);
    const button = document.getElementById(options.buttonId);
    const source = options.source;
    if (!video || !button || !source) {
      return;
    }
    let prepared = false;
    let hlsInstance = null;
    const prepare = () => {
      if (prepared) {
        return Promise.resolve();
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        return new Promise((resolve) => {
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, resolve);
        });
      }
      video.src = source;
      return Promise.resolve();
    };
    const play = () => {
      button.classList.add("is-hidden");
      prepare().then(() => video.play()).catch(() => {
        button.classList.remove("is-hidden");
      });
    };
    button.addEventListener("click", play);
    video.addEventListener("click", () => {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", () => button.classList.add("is-hidden"));
    video.addEventListener("pause", () => {
      if (!video.ended) {
        button.classList.remove("is-hidden");
      }
    });
    window.addEventListener("pagehide", () => {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };

  ready(() => {
    setupMobileNavigation();
    setupHeroCarousel();
    setupFiltering();
    setupSorting();
  });
})();
