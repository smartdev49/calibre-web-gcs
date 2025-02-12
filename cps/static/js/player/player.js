/*!
 *
 *  (c) 2013-2020, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */
console.log(calibre)
const jChapters = JSON.parse($("#chapters").val());
// Cache references to DOM elements.
var elms = [
    "track",
    "timer",
    "duration",
    "playBtn",
    "pauseBtn",
    "prevBtn",
    "nextBtn",
    "playlistBtn",
    "volumeBtn",
    "progress",
    "bar",
    "wave",
    "loading",
    "playlist",
    "list",
    "volume",
    "barEmpty",
    "barFull",
    "sliderBtn",
    "forwardBtn",
    "backwardBtn",
    "totalProgress",
    "bookmarkBtn",
    "bookmark",
    "playbackRate",
    "playbackRateBtn",
    "settings",
    "settingsBtn",
    "sleepTime",
    "sleepTimeBtn",
];
elms.forEach(function (elm) {
    window[elm] = document.getElementById(elm);
});

/**
 * Player class containing the state of our playlist and where we are in it.
 * Includes all methods for playing, skipping, updating the display, etc.
 * @param {Array} playlist Array of objects with playlist song details ({title, file, howl}).
 */
var Player = function (playlist) {
    this.playlist = playlist;
    this.index = 0;
    this.sleepTime = -1; // Stoped
    this.timer = null;
    // Display the title of the first track.
    // Display the title of the first track.
    track.innerHTML = "1. " + jChapters[0]["tags"]["title"];

    // Setup the playlist display.
    jChapters.forEach(function (iter) {
        var div = document.createElement("div");
        div.className = "list-song";
        div.innerHTML = iter["tags"]["title"];
        div.onclick = function () {
            seekTime(iter["start_time"]);
        };
        list.appendChild(div);
    });
};
Player.prototype = {
    /**
     * Play a song in the playlist.
     * @param  {Number} index Index of the song in the playlist (leave empty to play the first or current).
     */
    play: function (index) {
        var self = this;
        var sound;

        index = typeof index === "number" ? index : self.index;
        var data = self.playlist[index];

        // If we already loaded this track, use the current one.
        // Otherwise, setup and load a new Howl.
        if (data.howl) {
            sound = data.howl;
        } else {
            sound = data.howl = new Howl({
                // src: ['./audio/' + data.file + '.webm', './audio/' + data.file + '.mp3', './audio/' + data.file + '.m4b'],
                src: [$("#filename").val()],
                html5: true, // Force to HTML5 so that the audio can stream in (best for large files).
                preload: true,
                onplay: function () {
                    // Display the duration.
                    duration.innerHTML = self.formatTime(
                        Math.round(sound.duration())
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
        }

        // Begin playing the sound.
        sound.play();

        // Update the track display.
        // track.innerHTML = (index + 1) + '. ' + data.title;

        // Show the pause button.
        if (sound.state() === "loaded") {
            playBtn.style.display = "none";
            pauseBtn.style.display = "flex";
        } else {
            loading.style.display = "flex";
            playBtn.style.display = "none";
            pauseBtn.style.display = "none";
        }

        // Keep track of the index we are currently playing.
        self.index = index;
    },

    /**
     * Pause the currently playing track.
     */
    pause: function () {
        var self = this;

        // Get the Howl we want to manipulate.
        var sound = self.playlist[self.index].howl;

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
                index = self.playlist.length - 1;
            }
        } else {
            index = self.index + 1;
            if (index >= self.playlist.length) {
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

        // Stop the current track.
        if (self.playlist[self.index].howl) {
            self.playlist[self.index].howl.stop();
        }

        // Reset progress.
        progress.style.width = "0%";

        // Play the new track.
        self.play(index);
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
        var barWidth = (val * 90) / 100;
        barFull.style.width = barWidth * 100 + "%";
        sliderBtn.style.left =
            window.innerWidth * barWidth + window.innerWidth * 0.05 - 25 + "px";
    },
    forward: function () {
        var self = this;
        // Get the Howl we want to manipulate.
        var sound = self.playlist[self.index].howl;
        if (sound.playing()) {
            sound.seek(Math.min(sound.seek() + forwardJump, sound.duration()));
        }
    },
    backward: function () {
        var self = this;
        // Get the Howl we want to manipulate.
        var sound = self.playlist[self.index].howl;
        if (sound.playing()) {
            sound.seek(Math.max(sound.seek() - backwardJumb, 0));
        }
    },
    /**
     * Seek to a new position in the currently playing track.
     * @param  {Number} per Percentage through the song to skip.
     */
    seek: function (per) {
        var self = this;
        var sound = self.playlist[self.index].howl;
        // Convert the percent into a seek position.
        if (sound.playing()) {
            const pos = sound.duration() * per;
            sound.seek(pos).play();
        }
    },

    curSeek: function () {
        var self = this;
        var sound = self.playlist[self.index].howl;
        // Convert the percent into a seek position.
        if (sound.playing()) {
            return sound.seek();
        }
        return 0;
    },

    playRate: function (rate) {
        var self = this;
        var sound = self.playlist[self.index].howl;
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

        // Get the Howl we want to manipulate.
        var sound = self.playlist[self.index].howl;

        // Determine our current seek position.
        var seek = sound.seek() || 0;
        timer.innerHTML = self.formatTime(Math.round(seek));
        progress.style.width = ((seek / sound.duration()) * 100 || 0) + "%";
        var cur = jChapters.filter(
            (iter) => iter["start_time"] <= seek && iter["end_time"] >= seek
        )[0];
        $("#track").text(`${cur["id"]}. ${cur["tags"]["title"]}`);
        // If the sound is still playing, continue stepping.
        if (sound.playing()) {
            loading.style.display = "none";
            requestAnimationFrame(self.step.bind(self));
            if (self.sleepTime == 0) {
                sound.pause();
                self.sleepTime = -1;
            }
        }
    },
    /**
     * Toggle the playlist display on/off.
     */
    togglePlaylist: function () {
        var self = this;
        var display = playlist.style.display === "flex" ? "none" : "flex";

        setTimeout(
            function () {
                playlist.style.display = display;
            },
            display === "flex" ? 0 : 500
        );
        playlist.className = display === "flex" ? "fadein" : "fadeout";
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

    toggleBookmark: function () {
        var self = this;
        var display = bookmark.style.display === "flex" ? "none" : "flex";

        setTimeout(
            function () {
                bookmark.style.display = display;
            },
            display === "flex" ? 0 : 500
        );
        bookmark.className = display === "flex" ? "fadein" : "fadeout";
    },

    togglesleepTime: function () {
        var self = this;
        var display = sleepTime.style.display === "flex" ? "none" : "flex";

        setTimeout(
            function () {
                sleepTime.style.display = display;
            },
            display === "flex" ? 0 : 500
        );
        sleepTime.className = display === "flex" ? "fadein" : "fadeout";
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
    sleepAfter: function (secs) {
        var self = this;
        var sound = self.playlist[self.index].howl;
        if (self.timer) clearInterval(self.timer);
        // Convert the percent into a seek position.
        if (sound.playing()) {
            console.log("sec", secs);
            if (secs < 0) {
                self.sleepTime = sound.duration() - sound.seek();
            } else {
                self.sleepTime = Math.max(
                    0,
                    Math.min(secs, sound.duration() - sound.seek())
                );
            }
            self.timer = setInterval(function () {
                self.sleepTime = self.sleepTime - 1;
                $(".sleepTime").text(formatTime(self.sleepTime));
                if (self.sleepTime <= 0) {
                    clearInterval(self.timer);
                    self.timer = null;
                }
            }, 1000);
        }
    },
    delayTime: function (secs) {
        var self = this;
        var sound = self.playlist[self.index].howl;
        if (sound.playing()) {
            self.sleepTime = Math.max(
                0,
                Math.min(self.sleepTime + secs, sound.duration() - sound.seek())
            );
        }
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
var player = new Player([
    {
        title: "Rave Digger",
        file: "rave_digger",
        howl: null,
    },
]);
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
    player.seek(event.clientX / window.innerWidth);
});
playlistBtn.addEventListener("click", function () {
    player.togglePlaylist();
});
playlist.addEventListener("click", function () {
    player.togglePlaylist();
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
bookmarkBtn.addEventListener("click", function () {
    document.getElementById("current-seek").innerText = player.formatTime(
        Math.round(player.curSeek())
    );
    player.toggleBookmark();
});
bookmark.addEventListener("click", function (event) {
    if (event.target === bookmark) {
        player.toggleBookmark();
    }
});
sleepTimeBtn.addEventListener("click", function () {
    player.togglesleepTime();
});
sleepTime.addEventListener("click", function (event) {
    if (event.target === sleepTime) {
        player.togglesleepTime();
    }
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
        console.log(`#chp${iter["id"]}`);
        player.seek($(this).attr("start-time") / $(this).attr("total-time"));
    });
});
$(".time-line").on("click", function () {
    player.sleepAfter($(this).attr("sleep-after") * 60);
});

$(".delay-time").on("click", function () {
    player.delayTime($(this).attr("delay-time") * 60);
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
        var x = event.clientX || event.touches[0].clientX;
        var startX = window.innerWidth * 0.05;
        var layerX = x - startX;
        var per = Math.min(
            1,
            Math.max(0, layerX / parseFloat(barEmpty.scrollWidth))
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
    var sound = player.playlist[player.index].howl;
    if (sound) {
        var vol = sound.volume();
        var barWidth = vol * 0.9;
        sliderBtn.style.left =
            window.innerWidth * barWidth + window.innerWidth * 0.05 - 25 + "px";
    }
};
window.addEventListener("resize", resize);
resize();
