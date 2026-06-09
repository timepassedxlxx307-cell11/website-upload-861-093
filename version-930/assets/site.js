(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        if (!toggle) {
            return;
        }
        toggle.addEventListener('click', function () {
            document.body.classList.toggle('nav-open');
        });
    }

    function setupHeroCarousel() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        if (slides.length === 0) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
                show(index);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
        scopes.forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var typeSelect = scope.querySelector('[data-filter-type]');
            var yearSelect = scope.querySelector('[data-filter-year]');
            var regionSelect = scope.querySelector('[data-filter-region]');
            var categorySelect = scope.querySelector('[data-filter-category]');
            var list = document.querySelector('[data-filter-list]');
            var empty = document.querySelector('[data-empty-state]');
            if (!list) {
                return;
            }
            var items = Array.prototype.slice.call(list.children);

            function valueOf(element) {
                return element ? element.value.trim().toLowerCase() : '';
            }

            function applyFilters() {
                var keyword = valueOf(input);
                var type = valueOf(typeSelect);
                var year = valueOf(yearSelect);
                var region = valueOf(regionSelect);
                var category = valueOf(categorySelect);
                var visible = 0;

                items.forEach(function (item) {
                    var search = (item.getAttribute('data-search') || '').toLowerCase();
                    var itemType = (item.getAttribute('data-type') || '').toLowerCase();
                    var itemYear = (item.getAttribute('data-year') || '').toLowerCase();
                    var itemRegion = (item.getAttribute('data-region') || '').toLowerCase();
                    var itemCategory = (item.getAttribute('data-category') || '').toLowerCase();
                    var matched = true;

                    if (keyword && search.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (type && itemType !== type) {
                        matched = false;
                    }
                    if (year && itemYear !== year) {
                        matched = false;
                    }
                    if (region && itemRegion !== region) {
                        matched = false;
                    }
                    if (category && itemCategory !== category) {
                        matched = false;
                    }

                    item.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [input, typeSelect, yearSelect, regionSelect, categorySelect].forEach(function (element) {
                if (element) {
                    element.addEventListener('input', applyFilters);
                    element.addEventListener('change', applyFilters);
                }
            });
            applyFilters();
        });
    }

    function setupPlayer() {
        var video = document.getElementById('moviePlayer');
        if (!video) {
            return;
        }
        var overlay = document.querySelector('[data-play-target="moviePlayer"]');
        var source = video.getAttribute('data-video-source');
        var loaded = false;
        var hlsInstance = null;

        function loadSource() {
            if (loaded || !source) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                loaded = true;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                loaded = true;
                return;
            }
            video.src = source;
            loaded = true;
        }

        function startPlayback() {
            loadSource();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', startPlayback);
        }
        video.addEventListener('click', function () {
            if (!loaded) {
                startPlayback();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        video.addEventListener('emptied', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
            loaded = false;
        });
    }

    ready(function () {
        setupNavigation();
        setupHeroCarousel();
        setupFilters();
        setupPlayer();
    });
}());
