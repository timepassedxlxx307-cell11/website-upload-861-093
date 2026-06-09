(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(next) {
            if (!slides.length) {
                return;
            }
            current = (next + slides.length) % slides.length;
            slides.forEach(function (slide, index) {
                slide.classList.toggle('active', index === current);
            });
            dots.forEach(function (dot, index) {
                dot.classList.toggle('active', index === current);
            });
        }

        function startHero() {
            stopHero();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopHero() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startHero();
            });
        });

        hero.addEventListener('mouseenter', stopHero);
        hero.addEventListener('mouseleave', startHero);
        showSlide(0);
        startHero();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    var panels = document.querySelectorAll('[data-filter-panel]');
    panels.forEach(function (panel) {
        var searchInput = panel.querySelector('[data-page-search]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var empty = document.querySelector('[data-empty-state]');
        var state = {
            type: '',
            region: '',
            genre: '',
            query: ''
        };

        function applyFilters() {
            var shown = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var type = normalize(card.getAttribute('data-type'));
                var region = normalize(card.getAttribute('data-region'));
                var genre = normalize(card.getAttribute('data-genre'));
                var matchesQuery = !state.query || haystack.indexOf(normalize(state.query)) !== -1;
                var matchesType = !state.type || type.indexOf(normalize(state.type)) !== -1;
                var matchesRegion = !state.region || region.indexOf(normalize(state.region)) !== -1;
                var matchesGenre = !state.genre || genre.indexOf(normalize(state.genre)) !== -1;
                var visible = matchesQuery && matchesType && matchesRegion && matchesGenre;
                card.classList.toggle('hidden-by-filter', !visible);
                if (visible) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('show', shown === 0);
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', function () {
                state.query = searchInput.value;
                applyFilters();
            });
        }

        panel.querySelectorAll('[data-filter-type]').forEach(function (button) {
            button.addEventListener('click', function () {
                panel.querySelectorAll('[data-filter-type]').forEach(function (item) {
                    item.classList.remove('active');
                });
                button.classList.add('active');
                state.type = button.getAttribute('data-filter-type') || '';
                applyFilters();
            });
        });

        panel.querySelectorAll('[data-filter-region]').forEach(function (button) {
            button.addEventListener('click', function () {
                panel.querySelectorAll('[data-filter-region]').forEach(function (item) {
                    item.classList.remove('active');
                });
                button.classList.add('active');
                state.region = button.getAttribute('data-filter-region') || '';
                applyFilters();
            });
        });

        panel.querySelectorAll('[data-filter-genre]').forEach(function (button) {
            button.addEventListener('click', function () {
                panel.querySelectorAll('[data-filter-genre]').forEach(function (item) {
                    item.classList.remove('active');
                });
                button.classList.add('active');
                state.genre = button.getAttribute('data-filter-genre') || '';
                applyFilters();
            });
        });
    });

    var searchPageInput = document.querySelector('[data-search-page-input]');
    if (searchPageInput) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var empty = document.querySelector('[data-empty-state]');
        searchPageInput.value = initialQuery;

        function applySearch() {
            var query = normalize(searchPageInput.value);
            var shown = 0;
            cards.forEach(function (card) {
                var visible = !query || normalize(card.getAttribute('data-search')).indexOf(query) !== -1;
                card.classList.toggle('hidden-by-filter', !visible);
                if (visible) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('show', shown === 0);
            }
        }

        searchPageInput.addEventListener('input', applySearch);
        applySearch();
    }

    document.querySelectorAll('[data-player]').forEach(function (box) {
        var video = box.querySelector('video');
        var cover = box.querySelector('[data-player-cover]');
        var button = box.querySelector('[data-player-start]');
        var status = box.querySelector('[data-player-status]');
        var stream = video ? video.getAttribute('data-stream') : '';
        var hlsInstance = null;
        var ready = false;

        function setStatus(message) {
            if (status) {
                status.textContent = message || '';
            }
        }

        function prepareVideo() {
            return new Promise(function (resolve, reject) {
                if (!video || !stream) {
                    reject(new Error('no stream'));
                    return;
                }
                if (ready) {
                    resolve();
                    return;
                }
                ready = true;
                setStatus('正在加载影片...');
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                    video.addEventListener('loadedmetadata', function () {
                        resolve();
                    }, { once: true });
                    video.addEventListener('error', reject, { once: true });
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            reject(new Error('play error'));
                        }
                    });
                    return;
                }
                video.src = stream;
                video.addEventListener('loadedmetadata', function () {
                    resolve();
                }, { once: true });
                video.addEventListener('error', reject, { once: true });
            });
        }

        function startPlayback() {
            if (cover) {
                cover.classList.add('is-hidden');
            }
            prepareVideo().then(function () {
                setStatus('');
                return video.play();
            }).catch(function () {
                if (cover) {
                    cover.classList.remove('is-hidden');
                }
                setStatus('播放失败，请刷新重试');
            });
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                startPlayback();
            });
        }

        box.addEventListener('click', function (event) {
            if (event.target === video && video.paused) {
                startPlayback();
            }
        });

        if (video) {
            video.addEventListener('play', function () {
                if (cover) {
                    cover.classList.add('is-hidden');
                }
                setStatus('');
            });
            video.addEventListener('ended', function () {
                if (cover) {
                    cover.classList.remove('is-hidden');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    });
})();
