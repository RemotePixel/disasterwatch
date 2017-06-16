'use strict';

////////////////////////////////////////////////////////////////////////////////
//From Libra by developmentseed (https://github.com/developmentseed/libra)
function zeroPad(n, c) {
    const s = String(n);
    if (s.length < c) return zeroPad('0' + n, c);
    return s;
}

function sortScenes(a, b) {
    return Date.parse(b.getAttribute('img-date')) - Date.parse(a.getAttribute('img-date'));
}

function closePopup() {
    $('.mapboxgl-popup-close-button').click();
}

function textTolink(text) {
    const patt = new RegExp('^(http)|(www)');
    if (patt.test(text)){
        return '<a href="' + text + '" target="_blank">' + text + '</a>';
    } else {
        return '<span>' + text + '</span>';
    }
}

////////////////////////////////////////////////////////////////////////////////
//from http://jsfiddle.net/briguy37/2MVFd/
function generateUUID() {
    let d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c=='x' ? r : (r&0x3 | 0x8)).toString(16);
    });
    return uuid;
}

function getUrlVars() {
    const vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
        vars[key] = value;
    });
    return vars;
}
