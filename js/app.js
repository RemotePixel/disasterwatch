/*jslint browser: true*/
/*global $, jQuery, alert*/
/*global mapboxgl, mapboxgl, alert*/
/*global moment, moment, alert*/
/*global console, console, alert*/

// var map = new mapboxgl.Map({
//         container: 'map',
//         center: [0, 10],
//         zoom: 1,
//         attributionControl: true,
//         minZoom: 0,
//         maxZoom: 8
//     });
//
// map.addControl(new mapboxgl.Navigation());
// mapboxgl.accessToken = 'pk.eyJ1IjoidmluY2VudHNhcmFnbyIsImEiOiJjaWlleG1vdmowMWhydGtrc2xqcmQzNmhlIn0.80HAFLCQ6yUWCk4mwm6zbw';

// function getVolcanoes() {
//     'use strict';
//     volcanoesGroup.clearLayers();
//
//     var option;
//
//     $.getJSON('https://api.remotepixel.ca/volcanoes?', function (data) {
//         data.results.forEach(function (e) {
//             switch (e.vw.status) {
//             case 'inactive':
//                 option =  {icon: icon_inactive, title: e.Name};
//                 break;
//
//             case 'warning':
//                 option =  {icon: icon_warning, title: e.Name};
//                 break;
//
//             case 'active':
//                 option =  {icon: icon_active, title: e.Name};
//                 break;
//
//             case null:
//                 option =  {icon: icon_inactive, title: e.Name};
//                 break;
//             }
//
//             var vol = L.marker([e.Lat, e.Lon], option);
//             vol.properties = e;
//             volcanoesGroup.addLayer(vol);
//         });
//     });
// }
//var option;

//map.setView([0, 0], 2);
$("#earthquake-checkbox").change(function () {
    "use strict";
    $("#earthquake-checkbox").parent().toggleClass('green');
    // update_basemaps();
});

$("#fire-checkbox").change(function () {
    "use strict";
    $("#fire-checkbox").parent().toggleClass('green');
    // update_basemaps();
});

function getEarthquake() {
    "use strict";

    var dateValue = document.getElementsByClassName('date-button')[0].textContent,
        urlusgs = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=' + dateValue + '&endtime=' + moment(dateValue, 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD');
    // $.getJSON(urlusgs, function (data) {
        // data.features.forEach(function (e) {
            // var feat = L.circleMarker([e.geometry.coordinates[1], e.geometry.coordinates[0]], {
            //     "color": "#3b74f2",
            //     "radius": e.properties.mag * 2,
            //     "weight": 2,
            //     "opacity": 1,
            //     "fill": true
            // });
            // feat.properties = e.properties;
            // seismesGroup.addLayer(feat);
        // });
    // });
}
//
// function getFire() {
//     "use strict";
//
//     var dateValue = document.getElementsByClassName('date-button')[0].textContent,
//         urlusgs = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=' + dateValue + '&endtime=' + moment(dateValue, 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD');
//     // $.getJSON(urlusgs, function (data) {
//         // data.features.forEach(function (e) {
//             // var feat = L.circleMarker([e.geometry.coordinates[1], e.geometry.coordinates[0]], {
//             //     "color": "#3b74f2",
//             //     "radius": e.properties.mag * 2,
//             //     "weight": 2,
//             //     "opacity": 1,
//             //     "fill": true
//             // });
//             // feat.properties = e.properties;
//             // seismesGroup.addLayer(feat);
//         // });
//     // });
// }

function toggleParam(setting) {
    "use strict";
    switch (setting) {
    case 'basemaps':
        $('#settings-panel').removeClass('on');
        $('#settings-btn').removeClass('on');
        $('#basemaps-panel').toggleClass('on');
        $('#basemaps-btn').toggleClass('on');
        break;

    case 'settings':
        $('#basemaps-panel').removeClass('on');
        $('#basemaps-btn').removeClass('on');
        $('#settings-panel').toggleClass('on');
        $('#settings-btn').toggleClass('on');
        break;

    case 'add':
        $('#settings-panel').removeClass('on');
        $('#settings-btn').removeClass('on');
        $('#basemaps-panel').removeClass('on');
        $('#basemaps-btn').removeClass('on');
        break;

    case null:
        break;
    }
}

function getStyle(basename) {
    "use strict";

    var dateValue = document.getElementsByClassName('date-button')[0].textContent;

    switch (basename) {

    case 'Mapbox':
        $(".date-button").attr('disabled', 'disabled');
        var style = 'mapbox://styles/mapbox/satellite-streets-v9';
        break;

    default:
        $(".date-button").attr('disabled', false);
        var basemaps_url = "https://map1.vis.earthdata.nasa.gov/wmts-webmerc/" + basename + "/default/" + dateValue + "/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg",
            style = {
                "version": 8,
                "sources": {
                    "gibs-tiles": {
                        "type": "raster",
                        "tiles": [
                            basemaps_url
                        ],
                        "attribution" : [
                            ' <a href="http://openstreetmap.com">&copy; OpenStreetMap</a> ' +
                            ' <a href="https://earthdata.nasa.gov/about/science-system-description/eosdis-components/global-imagery-browse-services-gibs" >NASA EOSDIS GIBS</a>'
                        ],
                        "tileSize": 256
                    }
                },
                "layers": [{
                    "id": "gibs-tiles",
                    "type": "raster",
                    "source": 'gibs-tiles',
                    "minZoom": 1,
                    "maxZoom": 9
                }]
            };
            style.sources["coast"] = {
                "type": "raster",
                "tiles": [
                    "https://map1.vis.earthdata.nasa.gov/wmts-webmerc/Reference_Features/default/0/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png",
                ],
                "tileSize": 256
            };
            style.sources["places"] = {
                "type": "raster",
                "tiles": [
                    "https://map1.vis.earthdata.nasa.gov/wmts-webmerc/Reference_Labels/default/0/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png",
                ],
                "tileSize": 256
            };
            style.layers.push({
                "id": "coast",
                "type": "raster",
                "source": 'coast',
                "minZoom": 1,
                "maxZoom": 8
            });
            style.layers.push({
                "id": "places",
                "type": "raster",
                "source": 'places',
                "minZoom": 1,
                "maxZoom": 8
            });
    }

    return style
}

function changeOverlay(lyr_name) {
    "use strict";
    $("#basemaps-panel .side-view-content .side-element .link-on").each(function () {
        $(this).removeClass('on');
    });

    $("#" + lyr_name + " .link-on").addClass('on');

    map.setStyle(getStyle(lyr_name));
}

function update_basemaps() {
    "use strict";
    var dateValue = document.getElementsByClassName('date-button')[0].textContent
    map.setStyle(getStyle(dateValue));
}


$(document).ready(function () {
    "use strict";
    // getEarthquake();

    $(".date-button").datepicker({
        format : 'yyyy-mm-dd',
        autoclose : true,
        todayHighlight : true,
        startDate : '2012-05-08',
        endDate : moment.utc().format('YYYY-MM-DD')
    }).on('changeDate', function (e) {
        var dateValue = moment(e.date).format('YYYY-MM-DD'),
            overlay = document.getElementsByClassName('link-on on')[0].parentElement.getAttribute('id');

        $(".date-button").text(dateValue);

        if (moment(dateValue).isBefore('2015-11-24')) {
            var sat = overlay.slice(0,5);
            if (sat == 'VIIRS'){
                changeOverlay('MODIS_Terra_CorrectedReflectance_TrueColor');
            }
        }
        // update_basemaps();
    });

    // update_basemaps();

    $(".date-button").datepicker('setDate', moment.utc().subtract(1, 'days').format('YYYY-MM-DD'));
    //$('#modalUnderConstruction').modal();
});
