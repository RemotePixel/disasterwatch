/*jslint browser: true*/
/*global $, jQuery, alert*/
/*global mapboxgl, mapboxgl, alert*/
/*global moment, moment, alert*/
/*global turf, turf, alert*/
/*global console, console, alert*/

function getUrlVars() {
    "use strict";
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

var keys = getUrlVars();
if (keys.hasOwnProperty('uuid') && keys.hasOwnProperty('mail') ) {
    $("#uuid i").text(keys.uuid);
    $("#email i").text(keys.mail);
    var disasterwatchAPI = 'https://jriian4se3.execute-api.us-east-1.amazonaws.com/production/database/';

    $.ajax ({
        url: disasterwatchAPI + "getEvent",
        type: "GET",
        data: {"uuid": keys.uuid},
        dataType: "json",
        contentType: "application/json",
    })
    .success(function(data){
        // map.getSource('disasterdb').setData(data);

        $("#name i").text(data.features[0].properties.name);

        if (data.features[0].geometry.type === "Polygon") {
            var centroid = turf.centroid(data);
            var llstr = centroid.geometry.coordinates[0] + ',' + centroid.geometry.coordinates[1] + ',6';
        }

        if (data.features[0].geometry.type === "Point") {
            var llstr = data.features[0].geometry.coordinates[0] + ',' + data.features[0].geometry.coordinates[1] + ',9';
        }

        var accessToken = 'pk.eyJ1IjoidmluY2VudHNhcmFnbyIsImEiOiJjaWlleG1vdmowMWhydGtrc2xqcmQzNmhlIn0.80HAFLCQ6yUWCk4mwm6zbw',
            url = 'https://api.mapbox.com/v4/mapbox.light/geojson(' + encodeURIComponent(JSON.stringify(data.features[0])) + ')/' + llstr + '/800x800@2x.png?attribution=true&access_token=' + accessToken;
        $(".map-pane img").attr('src', url)

    })
    .always(function () {
        $('.map-pane .spin').addClass('display-none');
    })
    .fail(function () {
        console.log('Could not Retrieve Disaster Event to database');
    });
} else {
    $('.map-pane .spin').addClass('display-none');
}

function unsubscribe() {

    $('.btn-unsub').addClass('on');

    var request = {
            "uuid": $("#uuid i").text(),
            "mail" : $("#email i").text()
        };

    $.ajax ({
        url: disasterwatchAPI + "unsubscribe",
        type: "POST",
        data: JSON.stringify(request),
        dataType: "json",
        contentType: "application/json",
    })
    .success(function(data){
        $('.btn-unsub span').text('Done');
        $('.btn-unsub').removeClass('on');
        $('.btn-unsub').addClass('done');
    })
    .fail(function () {
        $('.btn-unsub').removeClass('on');
        $('.btn-unsub').addClass('error');
        $('.btn-unsub span').text('Error');
    });

}
