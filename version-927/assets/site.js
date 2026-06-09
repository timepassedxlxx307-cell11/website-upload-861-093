(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".mobile-toggle");
        var panel = document.querySelector(".mobile-panel");

        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                var opened = panel.hasAttribute("hidden");
                if (opened) {
                    panel.removeAttribute("hidden");
                } else {
                    panel.setAttribute("hidden", "");
                }
                toggle.setAttribute("aria-expanded", String(opened));
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var active = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === active);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            showSlide(0);
            window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var keywordInput = document.querySelector("[data-filter-keyword]");
        var regionSelect = document.querySelector("[data-filter-region]");
        var typeSelect = document.querySelector("[data-filter-type]");
        var yearSelect = document.querySelector("[data-filter-year]");
        var resetButton = document.querySelector("[data-filter-reset]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));

        if (keywordInput && query) {
            keywordInput.value = query;
        }

        function matchSelect(value, expected) {
            return !expected || value === expected;
        }

        function applyFilters() {
            if (!cards.length) {
                return;
            }

            var text = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
            var region = regionSelect ? regionSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var year = yearSelect ? yearSelect.value : "";

            cards.forEach(function (card) {
                var haystack = card.getAttribute("data-search") || "";
                var okText = !text || haystack.indexOf(text) !== -1;
                var okRegion = matchSelect(card.getAttribute("data-region"), region);
                var okType = matchSelect(card.getAttribute("data-type"), type);
                var okYear = matchSelect(card.getAttribute("data-year"), year);
                card.classList.toggle("hidden-card", !(okText && okRegion && okType && okYear));
            });
        }

        [keywordInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        if (resetButton) {
            resetButton.addEventListener("click", function () {
                if (keywordInput) {
                    keywordInput.value = "";
                }
                if (regionSelect) {
                    regionSelect.value = "";
                }
                if (typeSelect) {
                    typeSelect.value = "";
                }
                if (yearSelect) {
                    yearSelect.value = "";
                }
                applyFilters();
            });
        }

        if (cards.length) {
            applyFilters();
        }
    });
})();
