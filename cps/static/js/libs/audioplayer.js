$(document).ready(function () {

    soundManager.setup({
        // trade-off: higher UI responsiveness (play/progress bar), but may use more CPU.
        html5PollingInterval: 50,
        flashVersion: 9,
        debugMode: true,
    });


    $('#collapse').on('click', function (event) {
        // alert('clicked');
        // event.preventDefault(); // Prevent default link behavior

        // Toggle 'active' class to rotate the link
        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
            $('.chapter-list .chapter-table').addClass('hidden');
        } else {
            // Optionally, remove 'active' from all links if you want only one active at a time
            $(this).addClass('active');
            $('.chapter-list .chapter-table').removeClass('hidden');
        }
    });
    var playPauseButton = $('.sm2-play-control-bar .control-play');
    var progressBar = $('.progress-bar');
    var progress = $('.progress-bar .progress-current');
    var isDragging = false;
    var isPlaying = false;
    var filename = $('#filename').val();

    var backwardbtn = $('.sm2-play-control-bar .control-backward');
    var forwardbtn = $('.sm2-play-control-bar .control-forward');
    var durationLabel = $('.sm2-bookmeta-infos .duration-value');
    var currentPercentLabel = $('.sm2-progress-bar .current-percent');
    var currentDurationLabel = $('.sm2-progress-bar .current-duration');
    var resttimeLabel = $('.sm2-progress-bar .rest-time');
    var sound = soundManager.createSound({
        id: 'audio',
        url: filename,
        volume: 50,
        whileplaying: function () {
            var percentage = (this.position / this.durationEstimate) * 100;
            updateProgressBar(percentage);
            buttonState(0)
            durationLabel.text(formatTime(Math.round(this.durationEstimate / 1000)));
            currentDurationLabel.text(formatTime(Math.round(this.position / 1000)));
            currentPercentLabel.text(Math.round((this.position / this.durationEstimate) * 100) + '%');
            resttimeLabel.text('-' + formatTime(Math.round((this.durationEstimate - this.position) / 1000)));
        },
        onload: function () {

        },
        onplay: function () {
            buttonState(0)
        },
        onpause: function () {
            // isPlaying = false;

            buttonState(1);
        },
        onresume: function () {
            // isPlaying = true;
            buttonState(0);
        },
        whileloading: function () {
            // console.log('loading')
            buttonState(2);
        },
        onfinish: function () {
            buttonState(1);
            isPlaying = false;
            updateProgress(0);
        }
    })
    const buttonState = (status) => {
        if (status == 0) {
            $('.sm2-play-control-bar .control-play .play').hide();
            $('.sm2-play-control-bar .control-play .stop').show();
            $('.sm2-play-control-bar .control-play .load').hide();
        } else if (status == 1) {
            $('.sm2-play-control-bar .control-play .stop').hide();
            $('.sm2-play-control-bar .control-play .play').show();
            $('.sm2-play-control-bar .control-play .load').hide();
        } else {
            $('.sm2-play-control-bar .control-play .stop').hide();
            $('.sm2-play-control-bar .control-play .play').hide();
            $('.sm2-play-control-bar .control-play .load').show();
        }
    }
    playPauseButton.click(function () {
        if (!isPlaying) {
            sound.play();
            // sound.resume();
        } else {
            sound.pause();
        }
        isPlaying = !isPlaying;
    });

    progressBar.mousedown(function (e) {
        isDragging = true;
        updateProgress(e.pageX);
    });

    // $(document).mousemove(function (e) {
    //     if (isDragging) {
    //         updateProgress(e.pageX);
    //     }
    // });

    $(document).mouseup(function (e) {
        if (isDragging) {
            updateProgress(e.pageX);
            isDragging = false;
        }
    });

    backwardbtn.click(function () {
        sound.setPosition(sound.position - 10000);
    });

    forwardbtn.click(function () {
        sound.setPosition(sound.position + 10000);
    })

    function updateProgress(pageX) {
        var so = sound;
        if (so && so.duration) {
            var offset = progressBar.offset();
            var left = (pageX - offset.left);
            var totalWidth = progressBar.width();
            var percentage = Math.max(0, Math.min(1, left / totalWidth));
            // // var newTime = audio.duration * percentage;
            // // audio.currentTime = newTime;
            // $('.current-percent').text(Math.round(percentage * 100) + '%');
            // progress.css('width', (percentage * 100) + '%');
            so.setPosition(so.duration * percentage);
            if (so._iO && so._iO.whileplaying) {
                sound._iO.whileplaying.apply(so);
            }
        }

    }

    const updateProgressBar = (percentage) => {
        progress.css('width', percentage + '%');
    }

    const formatTime = (second) => {
        var hour = Math.floor(second / 3600);
        var min = Math.floor(second / 60);
        var sec = second % 60;
        if (hour) {
            return hour + ':' + min + ':' + sec;
        } else {
            return min + ':' + sec;
        }

    }

});
