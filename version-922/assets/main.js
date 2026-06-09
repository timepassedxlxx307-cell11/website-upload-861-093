document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    document.querySelectorAll(".global-search-form").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input");
            var keyword = input ? input.value.trim() : "";
            var target = keyword ? "movies.html?q=" + encodeURIComponent(keyword) : "movies.html";
            window.location.href = target;
        });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var previous = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5000);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
                startTimer();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    var searchInput = document.querySelector("[data-movie-search]");
    var regionSelect = document.querySelector("[data-region-filter]");
    var typeSelect = document.querySelector("[data-type-filter]");
    var yearSelect = document.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var emptyState = document.querySelector("[data-empty-state]");

    function applyMovieFilter() {
        if (!cards.length) {
            return;
        }

        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var region = regionSelect ? regionSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";
        var year = yearSelect ? yearSelect.value : "";
        var visible = 0;

        cards.forEach(function (card) {
            var text = (card.getAttribute("data-title") + " " + card.getAttribute("data-meta") + " " + card.textContent).toLowerCase();
            var ok = true;

            if (keyword && text.indexOf(keyword) === -1) {
                ok = false;
            }

            if (region && card.getAttribute("data-region") !== region) {
                ok = false;
            }

            if (type && card.getAttribute("data-type") !== type) {
                ok = false;
            }

            if (year && card.getAttribute("data-year") !== year) {
                ok = false;
            }

            card.style.display = ok ? "" : "none";

            if (ok) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("is-visible", visible === 0);
        }
    }

    [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
            control.addEventListener("input", applyMovieFilter);
            control.addEventListener("change", applyMovieFilter);
        }
    });

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query) {
            searchInput.value = query;
        }
        applyMovieFilter();
    }
});
