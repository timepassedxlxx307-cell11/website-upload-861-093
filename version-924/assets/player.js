(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  window.setupMoviePlayer = function (sourceUrl) {
    ready(function () {
      var video = document.getElementById('movie-player');
      var mask = document.getElementById('play-mask');
      if (!video || !mask || !sourceUrl) {
        return;
      }
      var prepared = false;
      var hlsInstance = null;

      function attachSource() {
        if (prepared) {
          return;
        }
        prepared = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(sourceUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = sourceUrl;
        }
      }

      function beginPlay() {
        attachSource();
        mask.classList.add('is-hidden');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            mask.classList.remove('is-hidden');
          });
        }
      }

      mask.addEventListener('click', beginPlay);
      video.addEventListener('click', function () {
        if (video.paused) {
          beginPlay();
        }
      });
      video.addEventListener('play', function () {
        mask.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          mask.classList.remove('is-hidden');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  };
})();
