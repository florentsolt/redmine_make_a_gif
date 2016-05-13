
var makeAGif = (function () {
    'use strict';

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
            var ag = new Animated_GIF({
                workerPath: workerPath,
                numWorkers: 2
            });
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
        var animationDelay = 600;
        var stoped = false;

        function start() {
            status('please authorize camera usage');
            GumHelper.startVideoStreaming(function(error, stream, videoElement, width, height) {
                if (error) {
                    stop(error);
                    return;
                }

                videoElement.width = videoWidth;
                videoElement.height = videoWidth * height / width;

                container.appendChild(videoElement);
                flash(record);

                function record() {
                    var shooter = new VideoShooter(videoElement, workerURL);

                    shooter.getShot(onFrameCaptured, 10, 0.2, function onProgress(progress) {
                        status('recording', 'green', progress);
                    });

                    function onFrameCaptured(data) {
                        stream.getTracks()[0].stop();
                        container.removeChild(videoElement);
                        confirm(data);
                    }
                }

            });
        }

        function flash(then) {
            var count = 0;
            function f() {
                count++;
                if (count === 6) {
                    clearInterval(interval);
                    then();
                    return;
                }
                status('get ready', count % 2 ? 'orange' : 'transparent');
            }
            var interval = setInterval(f, 500);
            f();
        }

        function confirm(data) {
            status('preview', 'blue');
            var preview = document.createElement('div');

            var urlCreator = window.URL || window.webkitURL;
            var imageUrl = urlCreator.createObjectURL(data);
            var img = document.createElement('img');
            img.src = imageUrl;
            style(img, {
                display: 'block'
            });
            preview.appendChild(img);
            container.appendChild(preview);

            var buttons = document.createElement('div');
            style(buttons, {
                display: 'flex'
            });
            preview.appendChild(buttons);

            function button(label, color, fn) {
                var b = document.createElement('button');
                b.setAttribute('type', 'button');
                b.textContent = label;
                b.addEventListener('click', fn);
                style(b, {
                    flexGrow: 1,
                    background: color,
                    color: 'white',
                    padding: '4px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    margin: '10px 10px 0',
                    border: 0
                });
                buttons.appendChild(b);
            }

            button('cancel', '#aaa', function () {
                stop('cancel');
            });

            button('retry', '#aaa', function () {
                container.removeChild(preview);
                start();
            });

            button('keep it', '#6e9e2d', function () {
                stop(null, data);
            });
        }


        function stop(error, data) {
            if (stoped) {
                return;
            }
            stoped = true;
            if (error === 'cancel') {
                status('canceled', 'red');
            } else if (error) {
                status('error', 'red');
            }
            style(overlay, {
                opacity: 0
            });
            setTimeout(function () {
                overlay.parentNode.removeChild(overlay);
                callback(error, data);
            }, animationDelay);
        }


        function status(label, color, width) {
            if (width === undefined) width = 1;
            style(statusProgress, {
                backgroundColor: color || 'transparent',
                width: (width * 100) + '%',
                height: color ? '10px' : '0'
            });
            statusLabel.textContent = label;
        }

        function style(element, s) {
            var name;
            for (name in s) {
                element.style[name] = s[name];
            }
        }

        var overlay = document.createElement('div');
        style(overlay, {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            position: 'fixed',
            left: '0',
            right: '0',
            top: '0',
            bottom: '0',
            zIndex: '1000',
            opacity: '0',
            transition: 'opacity ' + animationDelay + 'ms',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column'
        });

        overlay.classList.add('make-a-gif');
        document.body.appendChild(overlay);


        var container = document.createElement('div');
        container.classList.add('make-a-gif-container');
        style(container, {
            backgroundColor: 'black',
            padding: '10px',
            boxShadow: '0 0 10px black',
            borderRadius: '4px'
        });
        overlay.appendChild(container);

        var statusLabel = document.createElement('div');
        style(statusLabel, {
            color: 'white',
            textAlign: 'center'
        });
        container.appendChild(statusLabel);

        var statusBar = document.createElement('div');
        container.appendChild(statusBar);

        var statusProgress = document.createElement('div');
        statusBar.appendChild(statusProgress);


        setTimeout(style.bind(null, overlay, {opacity: 1}), 1);
        setTimeout(start, animationDelay);
    }

    return makeAGif;

}());
