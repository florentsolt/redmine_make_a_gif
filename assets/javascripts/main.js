// ==UserScript==
// @name           My nifty script
// @include https://ops.netvibes.com/*
// @namespace      Your unique author identifier
// @require        libs/Animated_GIF.js
// @require        libs/Animated_GIF.worker.js
// @require        libs/gumhelper.js
// @grant none
// ==/UserScript==


function VideoShooter (videoElement, workerPath) {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  context.scale(-1, 1); // mirror flip preview back to the normal direction

  canvas.width = videoElement.width;
  canvas.height = videoElement.height;

  this.getShot = function (callback, numFrames, interval, progressCallback) {
    numFrames = numFrames !== undefined ? numFrames : 3;
    interval = interval !== undefined ? interval : 0.1; // In seconds

    var pendingFrames = numFrames;
    var ag = new Animated_GIF({ workerPath: workerPath, numWorkers: 2 });
    ag.setSize(canvas.width, canvas.height);
    ag.setDelay(interval);

    captureFrame();

    function captureFrame() {
      ag.addFrame(videoElement);
      pendingFrames--;

      // Call back with an r value indicating how far along we are in capture
      progressCallback((numFrames - pendingFrames) / numFrames);

      if(pendingFrames > 0) {
        setTimeout(captureFrame, interval * 1000); // timeouts are in milliseconds
      } else {
        ag.getBlobGIF(function(image) {
          ag.destroy();
          callback(image);
        });
      }
    }
  };
}

function makeAGif(workerURL, callback) {
    var videoWidth = 300;

    function start() {
        GumHelper.startVideoStreaming(function(error, stream, videoElement, width, height) {
            if (error) {
                stop(error);
                return;
            }

            videoElement.width = videoWidth;
            videoElement.height = videoWidth * height / width;

            overlay.appendChild(videoElement);
            flash();

            function record() {
                var shooter = new VideoShooter(videoElement, workerURL);

                shooter.getShot(onFrameCaptured, 10, 0.2, function onProgress(progress) {
                    status('recording', 'green', progress);
                });

                function onFrameCaptured(data) {
                    stream.stop();
                    overlay.removeChild(videoElement);
                    confirm(data);
                }
            }

            function flash() {
                var count = 0;
                var interval = setInterval(function () {
                    count++;
                    if (count === 6) {
                        clearInterval(interval);
                        record();
                        return;
                    }
                    status('get ready', count % 2 ? 'orange' : 'transparent');
                }, 500);
            }
        });


    }

    function confirm(data) {
        status('preview');
        var preview = document.createElement('div');

        var urlCreator = window.URL || window.webkitURL;
        var imageUrl = urlCreator.createObjectURL(data);
        var img = document.createElement('img');
        img.src = imageUrl;
        img.style.display = 'block';
        preview.appendChild(img);
        overlay.appendChild(preview);

        function button(label, fn) {
            var b = document.createElement('button');
            b.setAttribute('type', 'button');
            b.textContent = label;
            b.addEventListener('click', fn);
            preview.appendChild(b);
        }

        button('cancel', function () {
            stop('cancel');
        });

        button('retry', function () {
            overlay.removeChild(preview);
            start();
        });

        button('keep it', function () {
            stop(null, data);
        });
    }


    function stop(error, data) {
        if (error === 'cancel') {
            status('canceled', 'red');
        } else if (error) {
            status('error', 'red');
        }
        overlay.style.opacity = '0';
        setTimeout(function () {
            overlay.parentNode.removeChild(overlay);
            callback(error, data);
        }, 1000);
    }


    function status(label, color, width) {
        statusProgress.style.backgroundColor = color || 'transparent';
        if (width === undefined) width = 1;
        statusProgress.style.width = (width * 100) + '%';
        statusLabel.textContent = label;
    }

    var overlay = document.createElement('div');
    overlay.style.backgroundColor = 'black';
    overlay.style.position = 'fixed';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.top = '0';
    overlay.style.bottom = '0';
    overlay.style.zIndex = '1000';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 1s';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.flexDirection = 'column';

    document.body.appendChild(overlay);

    var statusLabel = document.createElement('div');
    statusLabel.style.color = 'white';
    overlay.appendChild(statusLabel);

    var statusBar = document.createElement('div');
    statusBar.style.height = '10px';
    statusBar.style.width = videoWidth + 'px';

    var statusProgress = document.createElement('div');
    statusProgress.style.height = '10px';
    statusBar.appendChild(statusProgress);

    overlay.appendChild(statusBar);

    setTimeout(function () {
        overlay.style.opacity = '1';
    }, 1);

    setTimeout(start, 1000);
}

