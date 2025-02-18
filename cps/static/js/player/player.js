
const jChapters = JSON.parse($("#chapters").val());
// Cache references to DOM elements.
var elms = [
    "track", // track bar current chapter
    "timer", // track bar current time
    "duration", // track bar total time
    "playBtn", // player play btn
    "pauseBtn", // player pause btn
    "prevBtn",
    "nextBtn",
    "volumeBtn",
    "progress",
    "bar",
    "wave",
    "loading",
    "volume",
    "barEmpty",
    "barFull",
    "sliderBtn",
    "forwardBtn",
    "backwardBtn",
    "totalProgress",
    "playbackRate",
    "playbackRateBtn",
    "settings",
    "settingsBtn",
];
elms.forEach(function (elm) {
    window[elm] = document.getElementById(elm);
});

/**
 * Player class containing the state of our playlist and where we are in it.
 * Includes all methods for playing, skipping, updating the display, etc.
 * @param {Array} playlist Array of objects with playlist song details ({title, file, howl}).
 */
const Player = function (src, chapters, bookmark) {
    this.src = src;
    this.chapters = chapters;
    this.bookmark = bookmark;
    this.howl = null;
    this.index = 0;
    this.timer = null;
    track.innerHTML = "1. " + this.chapters[0]["tags"]["title"];
    this.init();
};
Player.prototype = {
    /**
     * Play a song in the playlist.
     * @param  {Number} index Index of the song in the playlist (leave empty to play the first or current).
     */
    updateIndexBasedOnPosition: function (position) {
        var self = this;
        const foundChapter = self.chapters.find(chapter => 
            Number(chapter['start_time']) < self.bookmark && Number(chapter['end_time']) > self.bookmark
        );
        if (foundChapter) {
            self.index = foundChapter['id'];
        }
        return self.index;
    },
    init: function () {
        var self = this;
        self.howl = new Howl({
            src: [self.src],
            html5: true, // Force to HTML5 so that the audio can stream in (best for large files).
            preload: true,
            onplay: function () {
                // Display the duration.
                duration.innerHTML = self.formatTime(
                    Math.round(self.howl.duration())
                );

                // Start updating the progress of the track.
                requestAnimationFrame(self.step.bind(self));

                // Start the wave animation if we have already loaded
                wave.container.style.display = "flex";
                bar.style.display = "none";
                pauseBtn.style.display = "flex";
            },
            onload: function () {
                // Start the wave animation.
                wave.container.style.display = "flex";
                bar.style.display = "none";
                loading.style.display = "none";
                self.howl.seek(calibre.bookmark ? calibre.bookmark : 0);                
                self.updateIndexBasedOnPosition(self.howl.seek());
            },
            onend: function () {
                // Stop the wave animation.
                wave.container.style.display = "none";
                bar.style.display = "flex";

                loading.style.display = "none";
                self.skip("next");
            },
            onpause: function () {
                // Stop the wave animation.
                wave.container.style.display = "none";
                bar.style.display = "flex";
            },
            onstop: function () {
                // Stop the wave animation.
                wave.container.style.display = "none";
                bar.style.display = "flex";
            },
            onseek: function () {
                // Start updating the progress of the track.
                
                requestAnimationFrame(self.step.bind(self));
            },
        });
    },
    play: function () {
        var self = this;
        // Begin playing the sound.
        self.howl.play();
        // Update the track display.
        // track.innerHTML = (index + 1) + '. ' + data.title;

        // Show the pause button.
        if (self.howl.state() === "loaded") {
            playBtn.style.display = "none";
            pauseBtn.style.display = "flex";
        } else {
            loading.style.display = "flex";
            playBtn.style.display = "none";
            pauseBtn.style.display = "none";
        }                
        self.timer = setInterval(self.timeout.bind(self), 1000);
        // Keep track of the index we are currently playing.
    },
    timeout: function () {
        var self = this;
        let csrf_token = $("input[name='csrf_token']").val();
        var sound = self.howl;
        if (sound.playing()) {            
            requestAnimationFrame(self.step.bind(self));
            $.ajax(calibre.bookmarkUrl, {
                method: "POST",

                headers: {
                    "X-CSRFToken": csrf_token, // Include the CSRF token in the headers
                },
                data: { bookmark: sound.seek() },
            }).fail(function (xhr, status, error) {
                console.log("Response:", xhr.responseText);
            });
        }
    },
    /**
     * Pause the currently playing track.
     */
    pause: function () {
        var self = this;

        // Get the Howl we want to manipulate.
        var sound = self.howl;

        // Puase the sound.
        sound.pause();

        // Show the play button.
        playBtn.style.display = "flex";
        pauseBtn.style.display = "none";
    },

    /**
     * Skip to the next or previous track.
     * @param  {String} direction 'next' or 'prev'.
     */
    skip: function (direction) {
        var self = this;

        // Get the next track based on the direction of the track.
        var index = 0;
        if (direction === "prev") {
            index = self.index - 1;
            if (index < 0) {
                index = self.chapters.length - 1;
            }
        } else {
            index = self.index + 1;
            if (index >= self.chapters.length) {
                index = 0;
            }
        }
        self.skipTo(index);
    },

    /**
     * Skip to a specific track based on its playlist index.
     * @param  {Number} index Index in the playlist.
     */
    skipTo: function (index) {
        var self = this;
        // console.log("index:", index)
        // Stop the current track.
        if (self.howl) {
            // Reset progress.
            progress.style.width = "0%";
            this.index = index;
            // Play the new track.
            // console.log(self.index)
            self.howl.seek(self.chapters[index]['start_time']);
        }
        self.play();
    },

    /**
     * Set the volume and update the volume slider display.
     * @param  {Number} val Volume between 0 and 1.
     */
    volume: function (val) {
        var self = this;

        // Update the global volume (affecting all Howls).
        Howler.volume(val);

        // Update the display on the slider.
        var barWidth = val;
        barFull.style.width = barWidth * 100 + "%";
        sliderBtn.style.left =
            window.innerWidth * barWidth + window.innerWidth * 0.05 - 25 + "px";
    },

    forward: function () {
        var self = this;
        // Get the Howl we want to manipulate.
        var sound = self.howl;
        if (sound.playing()) {
            
            sound.seek(Math.min(sound.seek() + forwardJump, sound.duration()));
            this.index = self.updateIndexBasedOnPosition(sound.seek())
        }
    },
    backward: function () {
        var self = this;
        // Get the Howl we want to manipulate.
        var sound = self.howl;
        if (sound.playing()) {
            sound.seek(Math.max(sound.seek() - backwardJumb, 0));
            this.index = self.updateIndexBasedOnPosition(sound.seek())
        }
    },
    /**
     * Seek to a new position in the currently playing track.
     * @param  {Number} per Percentage through the song to skip.
     */
    seek: function (per) {
        var self = this;
        var sound = self.howl;
        // Convert the percent into a seek position.
        if (sound.playing()) {
            const pos = sound.duration() * per;
            sound.seek(pos).play();
            this.index = self.updateIndexBasedOnPosition(sound.seek())
        }
    },

    curSeek: function () {
        var self = this;
        var sound = self.howl;
        // Convert the percent into a seek position.
        if (sound.playing()) {
            return sound.seek();
        }
        return 0;
    },

    playRate: function (rate) {
        var self = this;
        var sound = self.howl;
        if (sound !== null) {
            sound.rate(rate);
            return true;
        }
        return false;
    },
    /**
     * The step called within requestAnimationFrame to update the playback position.
     */
    step: function () {
        var self = this;
        var sound = self.howl;
        // Determine our current seek position.
        var seek = sound.seek() || 0;
        timer.innerHTML = self.formatTime(Math.round(seek));
        progress.style.width = ((seek / sound.duration()) * 100 || 0) + "%";
        // this.index = self.updateIndexBasedOnPosition(seek)
        $("#track").text(`${self.index}. ${self.chapters[self.index]["tags"]["title"]}`);
        // If the sound is still playing, continue stepping.
        if (sound.playing()) {
            loading.style.display = "none";
            // requestAnimationFrame(self.step.bind(self));
        }
        // console.log("step: index => ", self.index);
    },
    /**
     * Toggle the volume display on/off.
     */
    toggleVolume: function () {
        var self = this;
        var display = volume.style.display === "flex" ? "none" : "flex";

        setTimeout(
            function () {
                volume.style.display = display;
            },
            display === "flex" ? 0 : 500
        );
        volume.className = display === "flex" ? "fadein" : "fadeout";
    },

    toggleSettings: function () {
        var self = this;
        var display = settings.style.display === "flex" ? "none" : "flex";

        setTimeout(
            function () {
                settings.style.display = display;
            },
            display === "flex" ? 0 : 500
        );
        settings.className = display === "flex" ? "fadein" : "fadeout";
    },

    toggleplaybackRate: function () {
        var self = this;
        var display = playbackRate.style.display === "flex" ? "none" : "flex";

        setTimeout(
            function () {
                playbackRate.style.display = display;
            },
            display === "flex" ? 0 : 500
        );
        playbackRate.className = display === "flex" ? "fadein" : "fadeout";
    },

    /**
     * Format the time from seconds to M:SS.
     * @param  {Number} secs Seconds to format.
     * @return {String}      Formatted time.
     */
    formatTime: function (secs) {
        var hours = Math.floor(secs / 3600) || 0;
        var minutes = Math.floor((secs % 3600) / 60) || 0;
        var seconds = secs % 60 || 0;
        if (hours > 0)
            return (
                hours +
                ":" +
                (minutes < 10 ? "0" : "") +
                minutes +
                ":" +
                (seconds < 10 ? "0" : "") +
                seconds
            );
        return (
            (minutes < 10 ? "0" : "") +
            minutes +
            ":" +
            (seconds < 10 ? "0" : "") +
            seconds
        );
    },
};

const formatTime = (secs) => {
    var hours = Math.floor(secs / 3600) || 0;
    var minutes = Math.floor((secs % 3600) / 60) || 0;
    var seconds = Math.round(secs % 60) || 0;
    if (hours > 0)
        return (
            hours +
            ":" +
            (minutes < 10 ? "0" : "") +
            minutes +
            ":" +
            (seconds < 10 ? "0" : "") +
            seconds
        );
    return (
        (minutes < 10 ? "0" : "") +
        minutes +
        ":" +
        (seconds < 10 ? "0" : "") +
        seconds
    );
};

// Setup our new audio player class and pass it the playlist.
var player = new Player($("#filename").val(), jChapters, calibre.bookmark);
if ($("#chapters").val() !== "") {
    let htmlChapters = "";
    let htmlTimes = "";

    let total = jChapters[jChapters.length - 1]["end"];
    $(".chapter-count").text(jChapters.length);
    jChapters.forEach(function (iter) {
        htmlChapters += `<a class='chapter-line' id='chp${
            iter["id"]
        }' start-time='${iter["start_time"]}' total-time='${
            jChapters[jChapters.length - 1]["end_time"]
        }'><span>${iter["id"]}</span><span>${
            iter["tags"]["title"]
        }</span><span>${formatTime(
            iter["start_time"]
        )}</span><span>${formatTime(
            iter["end_time"] - iter["start_time"]
        )}</span></a>`;
        let per = (iter["end"] - iter["start"]) / total;
        htmlTimes += `<div class='ct-line' style='width:${per * 100}%'></div>`;
    });
    $("#chapter-time").html(htmlTimes);
    $(".chapter-lists").html(htmlChapters);
}

Player.prototype.seektime = function (pos) {
    let self = this;
    let sound = self.playlist[self.index].howl;
    if (sound.playing()) {
        sound.seek(pos);
        this.index = self.updateIndexBasedOnPosition(sound.seek())
        requestAnimationFrame(self.step.bind(self));
    }
};
// Bind our player controls.
playBtn.addEventListener("click", function () {
    player.play();
});
pauseBtn.addEventListener("click", function () {
    player.pause();
});
forwardBtn.addEventListener("click", () => {
    player.forward();
});
backwardBtn.addEventListener("click", () => {
    player.backward();
});
prevBtn.addEventListener("click", function () {
    player.skip("prev");
});
nextBtn.addEventListener("click", function () {
    player.skip("next");
});
totalProgress.addEventListener("click", function (event) {
    player.seek(event.offsetX / event.target.clientWidth);
    console.log("X: ", event.clientX)
    console.log("width: ", event.target.clientWidth)
});
volumeBtn.addEventListener("click", function () {
    player.toggleVolume();
});
volume.addEventListener("click", function () {
    player.toggleVolume();
});

// Setup the event listeners to enable dragging of volume slider.
barEmpty.addEventListener("click", function (event) {
    var per = event.layerX / parseFloat(barEmpty.scrollWidth);
    player.volume(per);
});
sliderBtn.addEventListener("mousedown", function () {
    window.sliderDown = true;
});
sliderBtn.addEventListener("touchstart", function () {
    window.sliderDown = true;
});
volume.addEventListener("mouseup", function () {
    window.sliderDown = false;
});
volume.addEventListener("touchend", function () {
    window.sliderDown = false;
});
playbackRateBtn.addEventListener("click", function () {
    player.toggleplaybackRate();
});
playbackRate.addEventListener("click", function (event) {
    if (event.target === playbackRate) {
        player.toggleplaybackRate();
    }
});
settingsBtn.addEventListener("click", function () {
    player.toggleSettings();
});
settings.addEventListener("click", function (event) {
    if (event.target === settings) {
        player.toggleSettings();
    }
});
$(".chapter-header").on("click", function () {
    player.seek(5000);
});
jChapters.forEach(function (iter) {
    $(`#chp${iter["id"]}`).on("click", function () {
        player.seek($(this).attr("start-time") / $(this).attr("total-time"));
    });
});

var currentRate = 1;
var rateInterval = 0.1;
var forwardJump = 10;
var backwardJumb = 10;
const setForwardJump = (jump) => {
    forwardJump = Number(jump);
};
const setBackwardJump = (jump) => {
    backwardJumb = Number(jump);
};
const playrate = (rate) => {
    if (!player.playRate(rate)) return;
    currentRate = rate;
    document.getElementById("currentRate").innerText =
        currentRate.toFixed(2) + "x";
};

const increasePlayrate = () => {
    playrate(Math.min(currentRate + rateInterval, 4));
};
const seekTime = (pos) => {
    player.seektime(pos);
};
const decreasePlayrate = () => {
    playrate(Math.max(currentRate - rateInterval, 0.5));
};

const setRateInterval = (val) => {
    rateInterval = Number(val);
};

var move = function (event) {
    if (window.sliderDown) {
        var x = event.offsetX || event.touches[0].offsetX;
        // var startX = window.innerWidth * 0.05;
        var layerX = x;
        var per = Math.min(
            1,
            Math.max(0, layerX / parseFloat(event.target.width))
        );
        player.volume(per);
    }
};

volume.addEventListener("mousemove", move);
volume.addEventListener("touchmove", move);

// Setup the "waveform" animation.
var wave = new SiriWave({
    container: waveform,
    width: window.innerWidth,
    height: window.innerHeight * 0.1,
    cover: true,
    speed: 0.03,
    amplitude: 0.9,
    frequency: 3,
    color: "#ffffff",
});
wave.start();

// Update the height of the wave animation.
// These are basically some hacks to get SiriWave.js to do what we want.
var resize = function () {
    var height = window.innerHeight * 0.3;
    var width = window.innerWidth;
    wave.height = height;
    wave.height_2 = height / 2;
    wave.MAX = wave.height_2 - 4;
    wave.width = width;
    wave.width_2 = width / 2;
    wave.width_4 = width / 4;
    wave.canvas.height = height;
    wave.canvas.width = width;
    // wave.container.style.margin = -(height / 2) + 'px auto';

    // Update the position of the slider.
    var sound = player.howl;
    if (sound) {
        var vol = sound.volume();
        var barWidth = vol * 0.9;
        sliderBtn.style.left =
            window.innerWidth * barWidth + window.innerWidth * 0.05 - 25 + "px";
    }
};
window.addEventListener("resize", resize);
resize();
