/*jslint browser: true*/
/*global $, jQuery, alert*/
/*global mapboxgl, mapboxgl, alert*/
/*global moment, moment, alert*/
/*global console, console, alert*/

////////////////////////////////////////////////////////////////////////////////
//From Libra by developmentseed (https://github.com/developmentseed/libra)
function zeroPad(n, c) {
    'use strict';
    var s = String(n);
    if (s.length < c) {
        return zeroPad('0' + n, c);
    }
    return s;
}

function sortScenes(a, b) {
    'use strict';
    return Date.parse(b.getAttribute('img-date')) - Date.parse(a.getAttribute('img-date'));
}

function closePopup() {
    'use strict';
    $('.mapboxgl-popup-close-button').click();
}

function textTolink(text) {
    var patt = new RegExp("^(http)|(www)");
    if (patt.test(text)){
        return '<a href="' + text + '" target="_blank">' + text + '</a>'
    } else {
        return '<span>' + text + '</span>'
    }
}

////////////////////////////////////////////////////////////////////////////////
//from http://jsfiddle.net/briguy37/2MVFd/
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c=='x' ? r : (r&0x3 | 0x8)).toString(16);
    });
    return uuid;
}

function getUrlVars() {
    "use strict";
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function getPlace(coordinates) {
    "use strict";

    //This is RemotePixel TOKEN
    var mapboxToken = 'pk.eyJ1IjoidmluY2VudHNhcmFnbyIsImEiOiJjaWlleG1vdmowMWhydGtrc2xqcmQzNmhlIn0.80HAFLCQ6yUWCk4mwm6zbw',
        mapboxAPIurl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + coordinates[0].toString() + ',' + coordinates[1].toString() + '.json?type=place&access_token=' + mapboxToken;

    $.getJSON(mapboxAPIurl)
        .success(function(data){
            document.getElementById("disasterPlace").value = data.features[0].place_name;
        });
}
