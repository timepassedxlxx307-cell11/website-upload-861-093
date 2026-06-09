(() => {
    const menuButton = document.querySelector('[data-menu-button]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', () => {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach((hero) => {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;

        const show = (target) => {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        };

        const start = () => {
            stop();
            timer = window.setInterval(() => show(index + 1), 5200);
        };

        const stop = () => {
            if (timer) {
                window.clearInterval(timer);
            }
        };

        dots.forEach((dot) => {
            dot.addEventListener('click', () => {
                show(Number(dot.dataset.heroDot || 0));
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', () => {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', () => {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    const normalize = (value) => String(value || '').toLowerCase().trim();

    document.querySelectorAll('[data-card-grid]').forEach((grid) => {
        const scope = grid.closest('.content-section') || document;
        const searchInput = scope.querySelector('[data-filter-input]');
        const typeSelect = scope.querySelector('[data-filter-type]');
        const regionSelect = scope.querySelector('[data-filter-region]');
        const yearSelect = scope.querySelector('[data-filter-year]');
        const cards = Array.from(grid.querySelectorAll('.movie-card'));

        const apply = () => {
            const query = normalize(searchInput ? searchInput.value : '');
            const typeValue = typeSelect ? typeSelect.value : '';
            const regionValue = regionSelect ? regionSelect.value : '';
            const yearValue = yearSelect ? yearSelect.value : '';

            cards.forEach((card) => {
                const searchText = normalize(card.dataset.search);
                const matchQuery = !query || searchText.includes(query);
                const matchType = !typeValue || card.dataset.type === typeValue;
                const matchRegion = !regionValue || card.dataset.region === regionValue;
                const matchYear = !yearValue || card.dataset.year === yearValue;
                card.classList.toggle('is-filter-hidden', !(matchQuery && matchType && matchRegion && matchYear));
            });
        };

        [searchInput, typeSelect, regionSelect, yearSelect].forEach((control) => {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        if (searchInput) {
            const params = new URLSearchParams(window.location.search);
            const queryValue = params.get('q');
            if (queryValue) {
                searchInput.value = queryValue;
            }
        }

        apply();
    });
})();
