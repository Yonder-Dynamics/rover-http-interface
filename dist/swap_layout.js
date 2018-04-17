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