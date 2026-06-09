(() => {
    const players = Array.from(document.querySelectorAll('[data-player]'));

    const attach = (video, url) => {
        if (video.dataset.ready === 'true') {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            video.hlsInstance = hls;
        } else {
            video.src = url;
        }

        video.dataset.ready = 'true';
    };

    players.forEach((player) => {
        const video = player.querySelector('video');
        const overlay = player.querySelector('[data-play-overlay]');
        const url = player.dataset.videoUrl;

        if (!video || !url) {
            return;
        }

        const play = () => {
            attach(video, url);
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            const request = video.play();
            if (request && typeof request.catch === 'function') {
                request.catch(() => {
                    video.controls = true;
                });
            }
        };

        if (overlay) {
            overlay.addEventListener('click', play);
        }

        video.addEventListener('click', () => {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener('play', () => {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
    });
})();
