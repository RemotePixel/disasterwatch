/*jslint browser: true*/
/*global $, jQuery, alert*/
/*global mapboxgl, mapboxgl, alert*/
/*global moment, moment, alert*/
/*global turf, turf, alert*/
/*global console, console, alert*/

mapboxgl.accessToken = 'pk.eyJ1IjoidmluY2VudHNhcmFnbyIsImEiOiJjaWlleG1vdmowMWhydGtrc2xqcmQzNmhlIn0.80HAFLCQ6yUWCk4mwm6zbw';
var map = new mapboxgl.Map({
        container: 'map',
        center: [0, 10],
        zoom: 1,
        style: 'mapbox://styles/vincentsarago/ciu1lp37x00ag2ilfp9vhb7cw',
        attributionControl: true,
        minZoom: 0,
        maxZoom: 8
    }),
    draw = mapboxgl.Draw({
        displayControlsDefault: false
    });

map.dragRotate.disable();
map.touchZoomRotate.disableRotation();

map.addControl(draw);
map.addControl(new mapboxgl.Navigation());

map.on('style.load', function () {
    "use strict";
    //Landsat 8 Layer
    map.addSource('landsat', {
        "type": "vector",
        "url": "mapbox://vincentsarago.8ib6ynrs"
    });
    map.addLayer({
        "id": "l8-highlighted",
        "type": "fill",
        "source": "landsat",
        "source-layer": "Landsat8_Desc_filtr2",
        "paint": {
            "fill-outline-color": "#1386af",
            "fill-color": "#0f6d8e",
            "fill-opacity": 0.3
        },
        "filter": ["in", "PATH", ""]
    });

    //Sentinel 2 Layer
    map.addSource('sentinel2', {
        "type": "vector",
        "url": "mapbox://vincentsarago.0qowxm38"
    });
    map.addLayer({
        "id": "s2-highlighted",
        "type": "fill",
        "source": "sentinel2",
        "source-layer": "Sentinel2_Grid",
        "paint": {
            "fill-outline-color": "#1386af",
            "fill-color": "#0f6d8e",
            "fill-opacity": 0.3
        },
        "filter": ["in", "Name", ""]
    });

    var geojson = {
        "type": "FeatureCollection",
        "features": []
    };

    map.addSource('sentinel-1', {
        'type': 'geojson',
        'data': geojson
    });

    map.addLayer({
        "id": "s1-highlighted",
        "type": "fill",
        "source": "sentinel-1",
        "paint": {
            "fill-outline-color": "#1386af",
            "fill-color": "#0f6d8e",
            "fill-opacity": 0.3
        },
        "filter": ["==", "id", ""]
    });

    // DisasterDB
    var geojson = {
        "type": "FeatureCollection",
        "features": []
    };

    map.addSource('disasterdb', {
        'type': 'geojson',
        'data': geojson
    });

    map.addLayer({
        "id": "disasterdb-points",
        "type": "circle",
        "source": "disasterdb",
        "filter": ["==", "$type", "Point"],
        "paint": {
            "circle-color": '#da7979',
            'circle-radius': {
                "base": 1.8,
                'stops': [
                    [0, 2],
                    [9, 10]
                ]
            }
        }
    });

    map.addLayer({
        "id": "disasterdb-polygons",
        "type": "fill",
        "source": "disasterdb",
        "filter": ["==", "$type", "Polygon"],
        "paint": {
            "fill-outline-color": "#da7979",
            "fill-color": "#ba3e3e",
            "fill-opacity": 0.4
        }
    });

    // USGS Latest EarthQuakes
    map.addSource('earthquakes', {
        'type': 'geojson',
        'data': geojson
    });

    map.addLayer({
        "id": "earthquakes-blur",
        "type": "circle",
        "source": "earthquakes",
        "maxzoom": 9,
        "layout": {'visibility' : 'none'},
        "paint": {
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
        }
    });

    // EONET Events
    map.addSource('eonet', {
        'type': 'geojson',
        'data': geojson
    });

    map.addLayer({
        "id": "eonet-point",
        "type": "symbol",
        "source": "eonet",
        "layout": {
            "visibility" : "none",
            "icon-image": "{icon}-15"
        }
    });

    // Volcanoes
    // map.addSource('volcanoes', {
    //     'type': 'geojson',
    //     'data': geojson
    // });
    //
    // map.addLayer({
    //     "id": "volcanoes",
    //     "type": "symbol",
    //     "source": "volcanoes",
    //     "layout": {
    //         "visibility" : "none",
    //         "icon-image": "volcano-15"
    //     }
    // });

    map.on('mousemove', function (e) {
        var mouseRadius = 1,
            feature = map.queryRenderedFeatures([
                [e.point.x - mouseRadius, e.point.y - mouseRadius],
                [e.point.x + mouseRadius, e.point.y + mouseRadius]
            ], {layers: ["eonet-point", "earthquakes-point", "disasterdb-points", "disasterdb-polygons"]})[0];

        if (feature) {
            map.getCanvas().style.cursor = 'pointer';

        } else {
            map.getCanvas().style.cursor = 'inherit';
        }

    }).on('click', function (e) {
        var mouseRadius = 1;
        if (map.getLayer("earthquakes-point").getLayoutProperty('visibility') !== 'none') {
            var feature = map.queryRenderedFeatures([
                [e.point.x - mouseRadius, e.point.y - mouseRadius],
                [e.point.x + mouseRadius, e.point.y + mouseRadius]
            ], {layers: ["earthquakes-point"]})[0];

            if (feature) {
                var popup = new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML('<div class="linetab bold">Name: ' + feature.properties.title + '</div>' +
                                '<div class="linetab">Date: ' + moment(feature.properties.time).utc().format('YYYY-MM-DD HH:mm:ss') + '(UTC)</div>' +
                                '<div class="linetab">Magnitude: ' + feature.properties.mag + '</div>' +
                                '<div class="linetab">Felt: ' + ((feature.properties.felt === null) ? 'No' : 'Yes') + '</div>' +
                                '<div class="linetab">Duration (min): ' + feature.properties.dmin + '</div>' +
                                '<div class="linetab">Tsunami: ' + ((feature.properties.tsunami === 0) ? 'No' : 'Yes') + '</div>' +
                                '<div class="linetab"><a target="_blank" href="' + feature.properties.url + '">Info</a></div>' +
                                '<div class="linetab"><a class="link" onclick="seeEQimages(\'' + feature.properties.detail + '\')">Search Images</a></div>')
                    .addTo(map);
            }
        }

        if (map.getLayer("eonet-point").getLayoutProperty('visibility') !== 'none') {
            var feature = map.queryRenderedFeatures([
                [e.point.x - mouseRadius, e.point.y - mouseRadius],
                [e.point.x + mouseRadius, e.point.y + mouseRadius]
            ], {layers: ["eonet-point"]})[0];

            if (feature) {
                var links = '',
                    sources = JSON.parse(feature.properties.sources);

                for (var j = 0; j < sources.length; j++) {
                    links += '<a target="_blank" href="' + sources[j].url + '">' + sources[j].id + '</a> '
                }

                var popup = new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML('<div class="linetab bold">Name: ' + feature.properties.title + '</div>' +
                                '<div class="linetab">Date: ' + moment(feature.properties.date).format('YYYY-MM-DD HH:mm:ss') + '(UTC)</div>' +
                                '<div class="linetab">Type: ' + feature.properties.dtype + '</div>' +
                                '<div class="linetab">Description: ' + feature.properties.description + '</div>' +
                                '<div class="linetab">Links: ' + links + '</div>') //+
                                // '<div class="linetab"><a class="link" onclick="seeEONETimages(\'' + feature.properties.id + '\')">Search Images</a></div>')
                    .addTo(map);
            }
        }

        var feature = map.queryRenderedFeatures([
            [e.point.x - mouseRadius, e.point.y - mouseRadius],
            [e.point.x + mouseRadius, e.point.y + mouseRadius]
        ], {layers: ["disasterdb-points", "disasterdb-polygons"]})[0];

        if (feature) {
            var dtype = '',
                disasterType = JSON.parse(feature.properties.dtype);

            for (var j = 0; j < disasterType.length; j++) {
                dtype += '<span type="dtype" class="' + disasterType[j] + '">' + disasterType[j] + '</span> ';
            }

            if (disasterType.length === 0) {
                dtype = '<span type="dtype" class="unclassified">unclassified</span>';
            }

            var popup = new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML('<div class="linetab bold">Name: ' + feature.properties.name + '</div>' +
                            '<div class="linetab uuid">uuid: ' + feature.properties.uuid + '</div>' +
                            '<div class="linetab disasterType">Type: ' + dtype + '</div>' +
                            '<div class="linetab">Location: ' + feature.properties.place + '</div>' +
                            '<div class="linetab">Start Date: ' + feature.properties.dateStart + '</div>' +
                            '<div class="linetab">End Date: ' + feature.properties.dateEnd + '</div>' +
                            '<div class="linetab">Comments: <br>' + feature.properties.comments + '</div>' +
                            '<div class="linetab"><a onclick="seeEvtDBimages(\'' + feature.properties.uuid + '\')">Search Images</a></div>' +
                            '<div class="linetab">' +
                                // '<a onclick="subscribeEvt(\'' + feature.properties.uuid + '\')">Subscribe</a> | ' +
                                '<a onclick="editEvt(\'' + feature.properties.uuid + '\')">Update</a> | ' +
                                '<a onclick="removeEvt(\'' + feature.properties.uuid + '\')">Remove</a>' +
                            '</div>')
                .addTo(map);
        }
    });

    var slider = document.getElementById('slider'),
        sliderValue = document.getElementById('slider-value');

    slider.addEventListener('input', function (e) {
        if (map.getSource("gibs-tiles")) {
            map.setPaintProperty('gibs-tiles', 'raster-opacity', parseInt(e.target.value, 10) / 100);
        }
        sliderValue.textContent = e.target.value + '%';
    });

    var q = d3.queue()
        .defer(getDisasterdb)
        .defer(getEarthquake)
        .defer(getEONETEvents)
        // .defer(getVolcanoes)
        .awaitAll(function(error, results) {
          if (error) throw error;
          //when ready :
          var keys = getUrlVars();
          if (keys.hasOwnProperty('event')) {
              editEvt(keys.event);
          } else {
              $('#modalUnderConstruction').modal();
          }
          $('.map .spin').addClass('display-none');
        });
});

////////////////////////////////////////////////////////////////////////////////
//Check if User
map.on('draw.selectionchange', function (e) {
    "use strict";
    if (!$(".leftblock").hasClass('in')) {
        if (e.features.length !== 0) {
            $("#modalQuestion").modal();
        }
    }
});

// map.on('draw.update', function () {
//     "use strict";
//     getImages();
// });
//
// // HACK
// // if user unselect the draw
// // this is not user friendly
// // but mapbox-gl is listening only on map clicks
// $(document).on("click", ".disaster-info", function() {
//     $("#map").click();
// });

map.on('draw.create', function (e) {
    "use strict";

    // limit draw Polygons size ??
    openleftBlock();
    getImages();

    if (e.features[0].geometry.type === "Polygon") {
        var bbox = turf.extent(e.features[0].geometry);
        map.fitBounds(bbox, {padding: 20});
    }

    if (e.features[0].geometry.type === "Point") {
        var round = turf.buffer(e.features[0], 100, 'kilometers'),
            bbox = turf.extent(round);
        map.fitBounds(bbox, {padding: 20});
    }
});


function setStyle(basename) {
    "use strict";

    if (map.getSource("gibs-tiles")) {
        map.removeLayer("gibs-tiles");
        map.removeSource("gibs-tiles");
    }

    switch (basename) {
    case 'MapboxMap':
        $(".date-button").attr('disabled', 'disabled');
        $("#slider").attr('disabled', 'disabled');
        $(".bottom-right-control").addClass("display-none");
        $(".bottom-right-control").removeClass("on");
        return;
    default:
        if ($(".bottom-right-control").hasClass("display-none")) {
            $(".bottom-right-control").removeClass("display-none");
            $(".bottom-right-control").addClass("on");
        }
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

        var opa = document.getElementById('slider').value / 100;

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
    setStyle(overlay);
}

function update_basemaps() {
    "use strict";
    var overlay = document.getElementsByClassName('link-on on')[0].parentElement.getAttribute('id');
    setStyle(overlay);
}

function drawOnMap(type) {
    "use strict";

    draw.deleteAll();

    if (draw.getMode() !== 'simple_select'){
        draw.changeMode("simple_select");
    }

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

function hoverS1(gr) {
    "use strict";
    map.setFilter("s1-highlighted", gr);
}

function hoverS2(gr) {
    "use strict";
    map.setFilter("s2-highlighted", gr);
}

function hoverL8(gr) {
    "use strict";
    map.setFilter("l8-highlighted", gr);
}

$("#volcanoes-checkbox").change(function () {
    "use strict";
    $("#volcanoes-checkbox").parent().toggleClass('green');
    if (document.getElementById("volcanoes-checkbox").checked) {
        map.setLayoutProperty('volcanoes', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('volcanoes', 'visibility', 'none');
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
