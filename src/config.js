function open_in_new_window(id, new_page_title, features) {
    var new_window;

    /* pauses video when opening in new window */
    var video = document.getElementById('video');
    video.pause();

    if (features !== undefined && features !== '') {
        new_window = window.open('', '_blank', features);
    }
    else {
        new_window = window.open('', '_blank');
    }

    var html_contents = document.getElementById(id);
    if (html_contents !== null) {
        new_window.document.write('<!doctype html><html><head><title>' + new_page_title + '</title><meta charset="UTF-8" /></head><body>' + html_contents.innerHTML + '</body></html>');
    }
}

function checkFocus() {
    if (document.hasFocus()) {
        var video = document.getElementById('video');
        video.play();
    } else {
        var video = document.getElementById('video');
        video.pause();
    }
}

window.setInterval(checkFocus, 500);

function swap() {

    var config1 = document.getElementById('content');
    var config2 = document.getElementById('content-2');

    if(config1.hasAttribute('data-new-window')) {
        config1.removeAttribute('data-new-window');
        config2.setAttribute('data-new-window','');
    } else {
        config2.removeAttribute('data-new-window');
        config1.setAttribute('data-new-window','');
    }

}