/**
 * @param {String} src url of sound file
 * @param {
 *          "id": number, 
 *          "time_base": string,
 *          "start": number,
 *          "start_time": number,
 *          "end": number,
 *          "end_time": number,
 *          "tags" : {
 *              "title": string
 *          }
 *  } chapter
 * @param {number} bookmark 
 */

var Player = function (src, chapter, bookmark) {
    this.chapter = chapter;
    this.src = src;
    this.howl = null;
    this.index = 0;
}

Player.prototype = {
    init: function () {
        var self = this;
        self.sound = new Howl({
            src: [self.src],
            html5: true,
            onload: function () {
                console.log("Audiobook loaded:", self.src);
            },
            onloaderror: function (id, error) {
                console.log("error:", error);
            },
            onplay: function () {

            },
            onend: function () {

            },
            onpause: function () {

            },
            onstop: function () {

            },
            onseek: function () {

            },
        })
    }
}