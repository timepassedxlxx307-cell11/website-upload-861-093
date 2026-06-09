(function () {
    window.initMoviePlayer = function (sourceUrl) {
        var video = document.getElementById("moviePlayer");
        var layer = document.querySelector(".player-cover");
        var button = document.getElementById("moviePlayButton");
        var loaded = false;
        var hls = null;

        if (!video || !sourceUrl) {
            return;
        }

        function attach() {
            if (loaded) {
                return;
            }

            loaded = true;

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else {
                video.src = sourceUrl;
            }
        }

        function play() {
            attach();
            video.controls = true;
            if (layer) {
                layer.classList.add("is-hidden");
            }
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    if (layer) {
                        layer.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (button) {
            button.addEventListener("click", play);
        }

        if (layer) {
            layer.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
