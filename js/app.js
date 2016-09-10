/*jslint browser: true*/
/*global $, jQuery, alert*/
/*global mapboxgl, mapboxgl, alert*/
/*global moment, moment, alert*/
/*global console, console, alert*/

mapboxgl.accessToken = 'pk.eyJ1IjoidmluY2VudHNhcmFnbyIsImEiOiJjaWlleG1vdmowMWhydGtrc2xqcmQzNmhlIn0.80HAFLCQ6yUWCk4mwm6zbw';
var map = new mapboxgl.Map({
        container: 'map',
        center: [0, 10],
        zoom: 1,
        style: 'mapbox://styles/mapbox/light-v9',
        attributionControl: true,
        minZoom: 0,
        maxZoom: 8
    });

var draw = mapboxgl.Draw({
    displayControlsDefault: false
});

map.dragRotate.disable();
map.touchZoomRotate.disableRotation();

map.addControl(draw);
map.addControl(new mapboxgl.Navigation());

map.on('style.load', function () {

    // USGS Latest EarthQuakes
    var geojson = {
      "type": "FeatureCollection",
      "features": []
    };

    map.addSource('earthquakes', {
        'type': 'geojson',
        'data': geojson
    });
    getEarthquake();

    var quakeColour = 'hsl(26, 89%, 44%)';
    map.addLayer({
        "id": "earthquakes-blur",
        "type": "circle",
        "source": "earthquakes",
        "maxzoom":9,
        "layout": {'visibility' : 'none'},
        "paint": {
            "circle-color": quakeColour,
            "circle-opacity": 0.8,
            'circle-radius': {
                'property': 'mag',
                "base": 1.8,
                'stops': [
                    [{zoom: 0,  value: 2}, 0.25],
                    [{zoom: 0,  value: 8}, 16],
                    [{zoom: 9, value: 2}, 10],
                    [{zoom: 9, value: 8}, 100]
                ]
            },
            'circle-color': {
                property: 'mag',
                stops: [
                    ['4.5', '#fff'],
                    ['8', '#f00']
                ]
            }
        }
    });

    map.addLayer({
       "id": "earthquakes-point",
       "type": "circle",
       "source": "earthquakes",
       "layout": {'visibility' : 'none'},
       "paint": {
           "circle-color": 'rgb(23, 14, 3)',
           'circle-radius': {
               "base": 1.1,
               "stops": [
                 [0, 0.5],
                 [8, 3]
               ]
           }
       },
    });

    // EONET Events
    var geojson = {
      "type": "FeatureCollection",
      "features": []
    };
    map.addSource('eonet', {
        'type': 'geojson',
        'data': geojson
    });
    getEONETEvents();

    map.addLayer({
       "id": "eonet-point",
       "type": "circle",
       "source": "eonet",
       "layout": {'visibility' : 'none'},
       "paint": {
           'circle-color': {
               property: 'code',
               stops: [
                   ['1', '#ff0505'],
                   ['10', '#ffffff']
               ]
           },
           'circle-radius': {
               "base": 4,
               "stops": [
                 [0, 4],
                 [8, 4]
               ]
           }
       },
    });

    map.on('mousemove', function(e) {
        var mouseRadius = 1;
            if (map.getLayer("earthquakes-point").getLayoutProperty('visibility') !== 'none') {
                var feature = map.queryRenderedFeatures([[e.point.x-mouseRadius,e.point.y-mouseRadius],[e.point.x+mouseRadius,e.point.y+mouseRadius]], {layers:["earthquakes-point"]})[0];
                if (feature) {
                    map.getCanvas().style.cursor = 'pointer';

                } else {
                    map.getCanvas().style.cursor = 'inherit';
                }
            }

            if (map.getLayer("eonet-point").getLayoutProperty('visibility') !== 'none') {
                var feature = map.queryRenderedFeatures([[e.point.x-mouseRadius,e.point.y-mouseRadius],[e.point.x+mouseRadius,e.point.y+mouseRadius]], {layers:["eonet-point"]})[0];
                if (feature) {
                    map.getCanvas().style.cursor = 'pointer';

                } else {
                    map.getCanvas().style.cursor = 'inherit';
                }
            }

    }).on('click', function(e){
        var mouseRadius = 1;
        if (map.getLayer("earthquakes-point").getLayoutProperty('visibility') !== 'none') {
            var feature = map.queryRenderedFeatures([[e.point.x-mouseRadius,e.point.y-mouseRadius],[e.point.x+mouseRadius,e.point.y+mouseRadius]], {layers:["earthquakes-point"]})[0];
            if (feature) {
                var popup = new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML('<div class="nom-eq">Name: ' + feature.properties.title + '</div>' +
                                '<div class="linetab">Date: ' + moment(feature.properties.time).utc().format('YYYY-MM-DD HH:mm:ss') + '(UTC)</div>' +
                                '<div class="linetab">Magnitude: ' + feature.properties.mag + '</div>' +
                                '<div class="linetab">Felt: ' + ((feature.properties.felt === null) ? 'No' : 'Yes') + '</div>' +
                                '<div class="linetab">Duration (min): ' + feature.properties.dmin + '</div>' +
                                '<div class="linetab">Tsunami: ' + ((feature.properties.tsunami === 0) ? 'No' : 'Yes') + '</div>' +
                                '<div class="linetab"><a target="_blank" href="' + feature.properties.url + '">Info</a></div>' +
                                '<div class="linetab"><a data-url="' + feature.properties.detail + '"class="link" onclick="addEQ(this)">Add To db</a></div>')
                    .addTo(map);
            }
        }

        if (map.getLayer("eonet-point").getLayoutProperty('visibility') !== 'none') {
            var feature = map.queryRenderedFeatures([[e.point.x-mouseRadius,e.point.y-mouseRadius],[e.point.x+mouseRadius,e.point.y+mouseRadius]], {layers:["eonet-point"]})[0];
            if (feature) {
                var links = '',
                    sources = JSON.parse(feature.properties.sources);
                for(var j = 0; j < sources.length; j++) {
                    links += '<a target="_blank" href="' + sources[j].url + '">' + sources[j].id + '</a> '
                }

                var popup = new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML('<div class="nom-eq">Name: ' + feature.properties.title + '</div>' +
                                '<div class="linetab">Date: ' + moment(feature.properties.date).format('YYYY-MM-DD HH:mm:ss') + '(UTC)</div>' +
                                '<div class="linetab">Type: ' + feature.properties.type + '</div>' +
                                '<div class="linetab">Description: ' + feature.properties.description + '</div>' +
                                '<div class="linetab">Links: ' + links + '</div>' +
                                '<div class="linetab"><a data-id="' + feature.properties.id + '" class="link" onclick="addEvt(this)">Add To db</a></div>')
                    .addTo(map);
            }
        }
    })

    var slider = document.getElementById('slider'),
        sliderValue = document.getElementById('slider-value');

    slider.addEventListener('input', function(e) {
        if (map.getSource("gibs-tiles")) {
            map.setPaintProperty('gibs-tiles', 'raster-opacity', parseInt(e.target.value, 10) / 100);
        }
        sliderValue.textContent = e.target.value + '%';
    });

})

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

map.on('draw.create', function(e){
    "use strict";
    $(".disaster-info").addClass('in');

    $("button[dwmenu]").each(function () {
        $(this).attr('disabled', true);
    });

    ['#settings-panel', '#settings-btn', '#basemaps-panel', '#basemaps-btn'].forEach(function(e){
        $(e).removeClass('on');
    });

    map.resize();

    if (e.features[0].geometry.type === "Polygon") {
        var bbox = turf.extent(e.features[0].geometry);
        map.fitBounds(bbox, {padding: 20});
    }

    if (e.features[0].geometry.type === "Point") {
        var round = turf.buffer(e.features[0], 100, 'kilometers'),
            bbox = turf.extent(round);
        map.fitBounds(bbox, {padding: 20});
    }
})

function addEQ(elem){
    draw.deleteAll();

    var urlusgs = elem.getAttribute('data-url');
    $.get("https://u4h2tjydjl.execute-api.us-west-2.amazonaws.com/remotepixel/https?url=" + urlusgs)
        .done(function (data) {
            var feature = data.geometry,
                featureId = draw.add(feature),
                features = draw.getAll();

            if (features.features[0].geometry.type === "Polygon") {
                var bbox = turf.extent(features.features[0].geometry);
                map.fitBounds(bbox, {padding: 20});
            }

            if (features.features[0].geometry.type === "Point") {
                var round = turf.buffer(features.features[0], 100, 'kilometers'),
                    bbox = turf.extent(round);
                map.fitBounds(bbox, {padding: 20});
            }

            //Pre-fill Information
            // Type
            // Name
            // Place
            // Date (DONE)
            // Comments
            //

            var dateValue = moment(data.properties.time).format('YYYY-MM-DD');
            $("#disasterStartDate").datepicker("setDate", dateValue);
            $("#disasterEndDate").datepicker("setDate", dateValue);

            $(".disaster-info").addClass('in');
            $("button[dwmenu]").each(function () {
                $(this).attr('disabled', true);
            });
            ['#settings-panel', '#settings-btn', '#basemaps-panel', '#basemaps-btn'].forEach(function(e){
                $(e).removeClass('on');
            });
            map.resize();
        });

}

function addEvt(elem){
    draw.deleteAll();

    var id = elem.getAttribute('data-id');
        url = 'http://eonet.sci.gsfc.nasa.gov/api/v2.1/events/' + id;

    $.get("https://u4h2tjydjl.execute-api.us-west-2.amazonaws.com/remotepixel/https?url=" + url)
        .done(function (data) {

            if (data.geometries.length > 1) {
                var feature = { "type": 'LineString', "coordinates": []};
                for(var j = 0; j < data.geometries.length; j++) {
                    feature.coordinates.push(data.geometries[j].coordinates)
                }
                var dateStartValue = moment(data.geometries[0].date).format('YYYY-MM-DD'),
                    dateEndValue = moment(data.geometries[data.geometries.length-1].date).format('YYYY-MM-DD');

                $("#disasterStartDate").datepicker("setDate", dateStartValue);
                $("#disasterEndDate").datepicker("setDate", dateEndValue);

            } else {
                var feature = { "type": 'Point', "coordinates": data.geometries[0].coordinates},
                    dateValue = moment(data.geometries[0].date).format('YYYY-MM-DD');

                $("#disasterStartDate").datepicker("setDate", dateValue);
                $("#disasterEndDate").datepicker("setDate", dateValue);
            }

            var featureId = draw.add(feature),
                features = draw.getAll();

            if (features.features[0].geometry.type === "LineString") {
                var bbox = turf.extent(features.features[0].geometry);
                map.fitBounds(bbox, {padding: 20});
            }

            if (features.features[0].geometry.type === "Point") {
                var round = turf.buffer(features.features[0], 100, 'kilometers'),
                    bbox = turf.extent(round);
                map.fitBounds(bbox, {padding: 20});
            }

            //Pre-fill Information
            // Type
            // Name
            // Place
            // Date (DONE)
            // Comments
            //

            $(".disaster-info").addClass('in');
            $("button[dwmenu]").each(function () {
                $(this).attr('disabled', true);
            });
            ['#settings-panel', '#settings-btn', '#basemaps-panel', '#basemaps-btn'].forEach(function(e){
                $(e).removeClass('on');
            });
            map.resize();
        });

}

function addDisast() {
    "use strict";

    //Check for info validity ??N
    //parse form
    var features = draw.getAll();


    // Add a way to update mapbox dataset ??
    // lambda function or mapbox api ??
}

function goToImage(){
    "use strict";
    //Get Image over Disaster and Display
    //Reset Form

    // $("button[dwmenu]").each(function () {
    //     $(this).attr('disabled', false);
    // });
    // $(".disaster-info").removeClass('in');
    //
    // map.resize();
}

function cancelAdd() {
    "use strict";
    $("button[dwmenu]").each(function () {
        $(this).attr('disabled', false);
    });
    $(".disaster-info").removeClass('in');
    map.resize();
    draw.deleteAll();
    //Reset disaster-info Form to init point

}

function addType(elem) {
    "use strict";
    var type = elem.childNodes[0],
        dTypelist = document.getElementsByClassName("disasterType")[0];

    if (dTypelist.getElementsByClassName(type.className).length !== 0) {
        var onList = dTypelist.getElementsByClassName(type.className);
        dTypelist.removeChild(onList[0]);
        elem.childNodes[1].className = "fa fa-check right-block";
    } else {
        elem.childNodes[1].className = "fa fa-check right-block-in";
        dTypelist.appendChild(type.cloneNode(true));
    }
}

$("#dateCheckbox").change(function () {
    "use strict";
    if (this.checked) {
        $("#disasterEndDate").attr('disabled', 'disabled');
    } else {
        $("#disasterEndDate").attr('disabled', false);
    }
});

$("#mailCheckbox").change(function () {
    "use strict";
    if (this.checked) {
        $("#InputEmail").attr('disabled', false);
    } else {
        $("#InputEmail").attr('disabled', 'disabled');
    }
});

$("#earthquake-checkbox").change(function () {
    "use strict";
    $("#earthquake-checkbox").parent().toggleClass('green');
    if (document.getElementById("earthquake-checkbox").checked) {
        map.setLayoutProperty('earthquakes-point', 'visibility', 'visible');
        map.setLayoutProperty('earthquakes-blur', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('earthquakes-point', 'visibility', 'none');
        map.setLayoutProperty('earthquakes-blur', 'visibility', 'none');
    }
});

$("#eonet-checkbox").change(function () {
    "use strict";
    $("#eonet-checkbox").parent().toggleClass('green');
    if (document.getElementById("eonet-checkbox").checked) {
        map.setLayoutProperty('eonet-point', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('eonet-point', 'visibility', 'none');
    }
});

////////////////////////////////////////////////////////////////////////////////

function getEarthquake() {
    "use strict";
    var urlusgs = 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson';
    $.get("https://u4h2tjydjl.execute-api.us-west-2.amazonaws.com/remotepixel/https?url=" + urlusgs)
        .done(function (data) {
            map.getSource('earthquakes').setData(data);
        });
}

function getEONETEvents() {
    "use strict";
    var eoneturl = 'http://eonet.sci.gsfc.nasa.gov/api/v2.1/events';
    $.get("https://u4h2tjydjl.execute-api.us-west-2.amazonaws.com/remotepixel/https?url=" + eoneturl)
        .done(function (data) {

            var geojson = {
              "type": "FeatureCollection",
              "features": []
            };

            for(var i = 0; i < data.events.length; i++) {
                var e = data.events[i];
                if (e.geometries.length > 1) {
                    for(var j = 0; j < e.geometries.length; j++) {
                        var feature = {};
                        feature.properties = {
                            'type': e.categories[0].title,
                            'id': e.id,
                            'description': e.description,
                            'code' : e.categories[0].id,
                            'link': e.link,
                            'sources' : JSON.stringify(e.sources),
                            'title' : e.title
                        };
                        feature.properties.date =  e.geometries[j].date;
                        feature.geometry = {'type': "Point", 'coordinates': e.geometries[j].coordinates};
                        geojson.features.push(feature);
                    }
                } else {
                    var feature = {};
                    feature.properties = {
                        'type': e.categories[0].title,
                        'id': e.id,
                        'description': e.description,
                        'code' : e.categories[0].id,
                        'link': e.link,
                        'sources' : JSON.stringify(e.sources),
                        'title' : e.title
                    };

                    feature.properties.dates = e.geometries[0].date;
                    feature.geometry = {'type': "Point", 'coordinates': e.geometries[0].coordinates};
                    geojson.features.push(feature);
                }
            }

            map.getSource('eonet').setData(geojson);
        });
}

function drawOnMap(type) {
    "use strict";

    draw.deleteAll();

    switch (type) {
    case 'point':
        draw.changeMode('draw_point');
        break;

    case 'polygon':
        draw.changeMode('draw_polygon');
        break;

    case null:
        break;
    }
}

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

function setStyle(basename) {
    "use strict";

    $(".date-button").attr('disabled', 'disabled');
    $("#slider").attr('disabled', 'disabled');

    if (map.getSource("gibs-tiles")) {
        map.removeLayer("gibs-tiles");
        map.removeSource("gibs-tiles");
    }

    switch (basename) {
    case 'MapboxMap':
        return;
    default:
        $(".date-button").attr('disabled', false);
        $("#slider").attr('disabled', false);
        var dateValue = document.getElementsByClassName('date-button')[0].textContent,
            basemaps_url = "https://map1.vis.earthdata.nasa.gov/wmts-webmerc/" + basename + "/default/" + dateValue + "/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg";

        map.addSource('gibs-tiles', {
            'type': 'raster',
            'tiles': [
                basemaps_url
            ],
            'attribution' : [
                '<a href="https://earthdata.nasa.gov/about/science-system-description/eosdis-components/global-imagery-browse-services-gibs" >NASA EOSDIS GIBS</a>'
            ],
            'tileSize': 256
        });

        var slider = document.getElementById('slider'),
            opa = (parseInt(slider.getAttribute('value'), 10) / 100);

        map.addLayer({
            'id': 'gibs-tiles',
            'type': 'raster',
            'source': 'gibs-tiles',
            "minzoom": 1,
            "maxzoom": 9,
            'paint': {"raster-opacity": opa}
        }, "admin-2-boundaries-bg");
    }
}

function changeOverlay(overlay) {
    "use strict";
    $("#basemaps-panel .side-view-content .side-element .link-on").each(function () {
        $(this).removeClass('on');
    });

    $("#" + overlay + " .link-on").addClass('on');
    setStyle(overlay)
}

function update_basemaps() {
    "use strict";
    var overlay = document.getElementsByClassName('link-on on')[0].parentElement.getAttribute('id');
    setStyle(overlay)
}

$(document).ready(function () {
    "use strict";

    $("#disasterStartDate").datepicker({
        format : 'yyyy-mm-dd',
        autoclose : true,
        todayHighlight : true,
        startDate : '2016-01-01',
        endDate : moment.utc().format('YYYY-MM-DD')
    }).on("changeDate", function(e){
        var dateValue = moment(e.date).format('YYYY-MM-DD');
        $("#disasterEndDate").datepicker("setStartDate", dateValue);
        $("#disasterEndDate").datepicker("setDate", dateValue);
        if (! $("#mailCheckbox").checked) $("#disasterEndDate").attr('disabled', false);
    });

    //Check for daterange ???
    $("#disasterEndDate").datepicker({
        format : 'yyyy-mm-dd',
        autoclose : true,
        todayHighlight : true,
        startDate : '2016-01-01',
        endDate : moment.utc().format('YYYY-MM-DD')
    });

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
        update_basemaps();
    });

    $(".date-button").datepicker('setDate', moment.utc().subtract(1, 'days').format('YYYY-MM-DD'));

    $("#disasterEndDate").attr('disabled', 'disabled');
    $("#slider").attr('disabled', 'disabled');
    // $('#modalUnderConstruction').modal();
});
