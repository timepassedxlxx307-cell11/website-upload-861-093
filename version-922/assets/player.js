function initMoviePlayer(streamUrl) {
    var video = document.querySelector(".movie-video");
    var overlay = document.querySelector(".player-overlay");
    var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-play-trigger]"));
    var prepared = false;
    var hls = null;

    if (!video || !streamUrl) {
        return;
    }

    function hideOverlay() {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    }

    function showOverlay() {
        if (overlay) {
            overlay.classList.remove("is-hidden");
        }
    }

    function prepareVideo() {
        var Hls = window.Hls;

        if (prepared) {
            return;
        }

        prepared = true;
        video.controls = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            video.load();
            return;
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                video.play().then(hideOverlay).catch(function () {});
            });
            return;
        }

        video.src = streamUrl;
        video.load();
    }

    function startPlayback() {
        prepareVideo();
        hideOverlay();
        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                if (!video.controls) {
                    showOverlay();
                }
            });
        }
    }

    triggers.forEach(function (trigger) {
        trigger.addEventListener("click", startPlayback);
    });

    video.addEventListener("click", function () {
        if (!prepared) {
            startPlayback();
        }
    });

    video.addEventListener("playing", hideOverlay);

    window.addEventListener("beforeunload", function () {
        if (hls && typeof hls.destroy === "function") {
            hls.destroy();
        }
    });
}
