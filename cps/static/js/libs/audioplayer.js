$(document).ready(function () {
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

    playPauseButton.click(function () {
        if (!isPlaying) {
            // playPauseButton.addClass('paused');
            $('.sm2-play-control-bar .control-play .play').hide();
            $('.sm2-play-control-bar .control-play .stop').show();
        } else {
            $('.sm2-play-control-bar .control-play .stop').hide();
            $('.sm2-play-control-bar .control-play .play').show();
        }
        isPlaying = !isPlaying;
    });

    // audio.addEventListener('timeupdate', function () {
    //     if (!isDragging) {
    //         var percentage = (audio.currentTime / audio.duration) * 100;
    //         progress.css('width', percentage + '%');
    //     }
    // });

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

    function updateProgress(pageX) {
        var offset = progressBar.offset();
        var left = (pageX - offset.left);
        var totalWidth = progressBar.width();
        var percentage = Math.max(0, Math.min(1, left / totalWidth));
        // var newTime = audio.duration * percentage;
        // audio.currentTime = newTime;
        $('.current-percent').text(Math.round(percentage * 100) + '%');
        progress.css('width', (percentage * 100) + '%');
    }
});
