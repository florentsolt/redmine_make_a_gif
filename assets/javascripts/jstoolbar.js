(function () {
    'use strict';

    // Add Slide
    jsToolBar.prototype.elements.make_a_gif = {
        type: 'button',
        title: 'Make a GIF!',
        fn: {
            wiki: function() {
                var toolbar = this;

                makeAGif('/plugin_assets/redmine_make_a_gif/javascripts/animated_gif.worker.js', function (error, data) {
                    if (error) {
                        if (error !== 'cancel') {
                            alert(error);
                        }
                    } else {
                        var date = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
                        var filename = date + '-' + Math.floor(Math.random() * 1e6) + '.gif';

                        var form = new FormData();
                        form.append('file', data, filename);

                        var request = new XMLHttpRequest();
                        request.open('POST', '/gif/upload', true);
                        request.send(form);
                        request.onload = function (e) {
                            if (request.status === 200) {
                                toolbar.encloseLineSelection('!/gif/' + filename + '!', '');
                            }
                        };
                    }
                });
            }
        }
    };

    // Move back the help at the end
    var help = jsToolBar.prototype.elements.help;
    delete jsToolBar.prototype.elements.help;
    jsToolBar.prototype.elements.help = help;

    $('html head').append('<style>.jstb_make_a_gif{ background-image: url(/images/user.png); }</style>');
}());
