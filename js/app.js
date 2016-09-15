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
                    [9, 10],
                ]
            },
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
        },
    });


    // USGS Latest EarthQuakes
    var geojson = {
        "type": "FeatureCollection",
        "features": []
    };
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
    var geojson = {
        "type": "FeatureCollection",
        "features": []
    };
    map.addSource('eonet', {
        'type': 'geojson',
        'data': geojson
    });

    // map.addLayer({
    //     "id": "eonet-point",
    //     "type": "circle",
    //     "source": "eonet",
    //     "layout": {'visibility' : 'none'},
    //     "paint": {
    //         'circle-color': {
    //             property: 'code',
    //             stops: [
    //                 ['1', '#ff0505'],
    //                 ['10', '#ffffff']
    //             ]
    //         },
    //         'circle-radius': {
    //             "base": 4,
    //             "stops": [
    //                 [0, 4],
    //                 [8, 4]
    //             ]
    //         }
    //     }
    // });

    map.addLayer({
        "id": "eonet-point",
        "type": "symbol",
        "source": "eonet",
        "layout": {
            "visibility" : "none",
            "icon-image": "{icon}-15"
        }
    });

    map.on('mousemove', function (e) {
        var mouseRadius = 1;
        var feature = map.queryRenderedFeatures([[e.point.x-mouseRadius,e.point.y-mouseRadius],[e.point.x+mouseRadius,e.point.y+mouseRadius]], {layers:["eonet-point", "earthquakes-point", "disasterdb-points", "disasterdb-polygons"]})[0];
        if (feature) {
            map.getCanvas().style.cursor = 'pointer';

        } else {
            map.getCanvas().style.cursor = 'inherit';
        }

    }).on('click', function (e) {
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
                                '<div class="linetab"><a data-url="' + feature.properties.detail + '"class="link" onclick="seeEQimages(this)">See Images</a></div>')
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
                                '<div class="linetab">Type: ' + feature.properties.dtype + '</div>' +
                                '<div class="linetab">Description: ' + feature.properties.description + '</div>' +
                                '<div class="linetab">Links: ' + links + '</div>') //+
                                // '<div class="linetab"><a data-id="' + feature.properties.id + '" class="link" onclick="seeEvtimages(this)">See Images</a></div>')
                    .addTo(map);
            }
        }


        var feature = map.queryRenderedFeatures([[e.point.x-mouseRadius,e.point.y-mouseRadius],[e.point.x+mouseRadius,e.point.y+mouseRadius]], {layers:["disasterdb-points", "disasterdb-polygons"]})[0];
        if (feature) {
            var dtype = '',
                sources = JSON.parse(feature.properties.dtype);

            for(var j = 0; j < sources.length; j++) {
                dtype += '<span class="' + sources[j] + '">' + sources[j] + '</span> '
            }

            var popup = new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML('<div class="nom-eq">Name: ' + feature.properties.name + '</div>' +
                            '<div class="linetab">Type: ' + dtype + '</div>' +
                            '<div class="linetab">Location: ' + feature.properties.place + '</div>' +
                            '<div class="linetab">Start Date: ' + feature.properties.dateStart + '</div>' +
                            '<div class="linetab">End Date: ' + feature.properties.dateEnd + '</div>' +
                            '<div class="linetab">Comments: ' + feature.properties.comments + '</div>' +
                            '<div class="linetab"><a onclick="seeEvtDBimages(\'' + feature.properties.uuid + '\')">See Images</a></div>' +
                            // '<div class="linetab"><a onclick="subscribeEvt(\'' + feature.properties.uuid + '\')">SubScribe</a></div>' +
                            '<div class="linetab"><a onclick="removeEvt(\'' + feature.properties.uuid + '\')">Remove Event</a> <a onclick="editEvt(\'' + feature.properties.uuid + '\')">Edit Event</a></div>')
                .addTo(map);
        }
    })

    var slider = document.getElementById('slider'),
        sliderValue = document.getElementById('slider-value');

    slider.addEventListener('input', function (e) {
        if (map.getSource("gibs-tiles")) {
            map.setPaintProperty('gibs-tiles', 'raster-opacity', parseInt(e.target.value, 10) / 100);
        }
        sliderValue.textContent = e.target.value + '%';
    });


    getDisasterdb();
    getEarthquake();
    getEONETEvents();
    //Wrapping in d3-queue - loading app

})

////////////////////////////////////////////////////////////////////////////////
//Check if User
map.on('draw.selectionchange', function(e){
    "use strict";
    if (! $(".leftblock").hasClass('in')){
        if (e.features.length != 0) {
            $("#modalQuestion").modal();
        }
    }
});

map.on('draw.create', function(e){
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
////////////////////////////////////////////////////////////////////////////////

function hoverS2(gr) {
    "use strict";
    map.setFilter("s2-highlighted", gr);
}

function hoverL8(gr) {
    "use strict";
    map.setFilter("l8-highlighted", gr);
}

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
    return Date.parse(b.date) - Date.parse(a.date);
}

function getImages() {

    $('.disaster-images .spin').removeClass('display-none');
    $('.map .spin').removeClass('display-none');
    $('.img-preview').empty();

    var features = draw.getAll(),
        sat_api = 'https://api.developmentseed.org/satellites',
        jsonObj = {
            intersects: features.features[0],
            limit: 2000
        };

    $.ajax ({
        url: sat_api,
        type: "POST",
        data: JSON.stringify(jsonObj),
        dataType: "json",
        contentType: "application/json",
    })
    .success(function(data){
        if (data.hasOwnProperty('errorMessage')){
            $('.img-preview').append('<span class="nodata-error">No image found</span>');
            $('.spin').addClass('display-none');
            return;
        }
        if (data.meta.found !== 0) {
            var i,
                scene = {},
                results = [];

            for (i = 0; i < data.results.length; i += 1) {
                scene = {};
                scene.date = data.results[i].date;
                scene.cloud = data.results[i].cloud_coverage;
                scene.sceneID = data.results[i].scene_id;

                if (data.results[i].satellite_name === 'landsat-8') {
                    scene.sat = 'landsat';
                    scene.path = data.results[i].path.toString();
                    scene.row = data.results[i].row.toString();
                    scene.grid = data.results[i].path + '/' + data.results[i].row;
                    scene.usgsURL = data.results[i].cartURL;
                    scene.browseURL = data.results[i].browseURL.replace('http://', "https://");;
                    scene.AWSurl = 'http://landsat-pds.s3.amazonaws.com/L8/' + zeroPad(data.results[i].path, 3) + '/' + zeroPad(data.results[i].row, 3) + '/' + data.results[i].sceneID + '/';
                    results.push(scene);
                } else {
                    scene.sat = 'sentinel';
                    scene.utm_zone = data.results[i].utm_zone.toString();
                    scene.grid_square = data.results[i].grid_square;
                    scene.coverage = data.results[i].data_coverage_percentage;
                    scene.latitude_band = data.results[i].latitude_band;
                    scene.browseURL = data.results[i].thumbnail.replace('.jp2', ".jpg");
                    scene.path = data.results[i].aws_path.replace('tiles', "#tiles");
                    scene.AWSurl = 'http://sentinel-s2-l1c.s3-website.eu-central-1.amazonaws.com/' + scene.path + '/';
                    scene.grid = scene.utm_zone + scene.latitude_band + scene.grid_square;
                    results.push(scene);
                }
            }

            results.sort(sortScenes);
            for (i = 0; i < results.length; i += 1) {

                var imgMeta = results[i];

                if (imgMeta.sat === 'landsat') {
                    var hoverstr = "['all', ['==', 'PATH', " + imgMeta.path + "], ['==', 'ROW', " + imgMeta.row + "]]";
                    $('.img-preview').append(
                        '<div class="item" onmouseover="hoverL8(' + hoverstr + ')" onmouseout="hoverL8(' + "['all', ['==', 'PATH', ''], ['==', 'ROW', '']]" + ')">' +
                            '<img class="img-item img-responsive lazy lazyload" data-src="' + imgMeta.browseURL + '" class="img-responsive">' +
                            '<div class="result-overlay">' +
                                '<span>' + imgMeta.sceneID + '</span>' +
                                '<span><i class="fa fa-calendar-o"></i> ' + imgMeta.date + '</span>' +
                                '<span><i class="fa fa-cloud"></i> ' + imgMeta.cloud + '%</span>' +
                                '<span>Link:</span>' +
                                '<div class="btnDD" onclick="feeddownloadL8(\'' + imgMeta.AWSurl + '\',\'' + imgMeta.sceneID + '\')"><i class="fa fa-download"></i></div>' +
                                '<a target="_blank" href="' + imgMeta.AWSurl + 'index.html"><img src="/img/aws.png"> </a>' +
                                '<a target="_blank" href="' + imgMeta.usgsURL + '"><img src="/img/usgs.jpg"></a>' +
                            '</div>' +
                            '</div>'
                    );

                } else {
                    var hoverstr = "['in', 'Name', '" + imgMeta.grid + "']";
                    $('.img-preview').append(
                        '<div class="item" onmouseover="hoverS2(' + hoverstr + ')" onmouseout="hoverS2(' + "['in', 'Name', '']" + ')">' +
                            '<img class="img-item img-responsive lazy lazyload" data-src="' + imgMeta.browseURL + '" class="img-responsive">' +
                            '<div class="result-overlay">' +
                                '<span>' + imgMeta.sceneID + '</span>' +
                                '<span><i class="fa fa-calendar-o"></i> ' + imgMeta.date + '</span>' +
                                '<span><i class="fa fa-cloud"></i> ' + imgMeta.cloud + '%</span>' +
                                '<span>Link:</span>' +
                                '<div class="btnDD" onclick="feeddownloadS2(\'' + imgMeta.path.replace('#tiles', "tiles") + '\',\'' + imgMeta.browseURL + '\')"><i class="fa fa-download"></i></div>' +
                                '<a target="_blank" href="' + imgMeta.AWSurl + '"><img src="/img/aws.png"> </a>' +
                            '</div>' +
                            '</div>'
                    );
                }
            }

        } else {
            $('.img-preview').append('<span class="nodata-error">No image found</span>');
        }
    })
    .always(function () {
        $('.disaster-images .spin').addClass('display-none');
        $('.map .spin').addClass('display-none');
    })
    .fail(function () {
        $('.img-preview').append('<span class="serv-error">Server Error: Please contact <a href="mailto:contact@remotepixel.ca">contact@remotepixel.ca</a></span>');
    });
}

////////////////////////////////////////////////////////////////////////////////
function seeEQimages(elem){
    draw.deleteAll();

    var urlusgs = elem.getAttribute('data-url');
    $.get("https://u4h2tjydjl.execute-api.us-west-2.amazonaws.com/remotepixel/https?url=" + urlusgs)
        .done(function (data) {
            var feature = data.geometry,
                featureId = draw.add(feature),
                features = draw.getAll(),
                dateValue = moment(data.properties.time).format('YYYY-MM-DD');

            //Pre-fill Information
            // Type
            // Name
            // Place
            // Date (DONE)
            // Comments
            //

            $("#disasterStartDate").datepicker("setDate", dateValue);
            $("#disasterEndDate").datepicker("setDate", dateValue);

            var round = turf.buffer(features.features[0], 100, 'kilometers'),
                bbox = turf.extent(round);
            map.fitBounds(bbox, {padding: 20});
            openleftBlock();
            getImages();
        });
}

function seeEvtimages(elem){
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

            //Pre-fill Information
            // Type
            // Name
            // Place
            // Date (DONE)
            // Comments
            //

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

            openleftBlock();
            getImages();
        });
}

function seeEvtDBimages(id) {
    "use strict";
    $(".tab-selector-2").attr('disabled', true);
    var features = map.getSource("disasterdb")._data.features.filter(function(e){
        return (e.properties.uuid === id);
    });

    features[0].geometry.coordinates = features[0].geometry.coordinates.map(function(e){
    	return parseFloat(e.toFixed(5));
    });

    var featureId = draw.add(features[0]),
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

    openleftBlock();
    getImages();
}

////////////////////////////////////////////////////////////////////////////////

function addDisastTodb() {
    "use strict";

    $('.disaster-info .spin').removeClass('display-none');
    $('.map .spin').removeClass('display-none');

    //Check for info validity ??N
    //parse form
    var features = draw.getAll(),
        geojson = features.features[0];

    delete geojson['id'];

    geojson.properties.uuid = generateUUID();
    geojson.properties.mailTO = (document.getElementById("mailCheckbox").checked)? document.getElementById("disastermailTo").value : '';
    geojson.properties.dtype = $('.disasterType').children().map(function(){
        return this.className
    }).toArray();
    geojson.properties.name = document.getElementById("disasterName").value;
    geojson.properties.place = document.getElementById("disasterPlace").value;
    geojson.properties.dateStart = document.getElementById("disasterStartDate").value;
    geojson.properties.dateEnd = (document.getElementById("dateCheckbox").checked)? '' : document.getElementById("disasterEndDate").value;
    geojson.properties.comments = document.getElementById("disasterComments").value.replace(/\r?\n/g, '<br/>');

    $.ajax ({
        url: "https://shqxykh2td.execute-api.us-west-2.amazonaws.com/v1/add",
        type: "POST",
        data: JSON.stringify(geojson),
        dataType: "json",
        contentType: "application/json",
    })
    .success(function(data){
        getDisasterdb();
    })
    .always(function () {
        $('.disaster-info .spin').addClass('display-none');
        $('.map .spin').addClass('display-none');
    })
    .fail(function () {
        console.log('fail');
        // $('.img-preview').append('<span class="serv-error">Server Error: Please contact <a href="mailto:contact@remotepixel.ca">contact@remotepixel.ca</a></span>');
    });
    resetForm();
    closeleftblock();
}

function resetForm() {
    "use strict";
    $(".disasterType").empty();
    $(".disaster-info .dropdown-menu i").each(function(){
        $(this).removeClass('right-block-in');
        $(this).addClass('right-block');
    });

    $(".disaster-info input").each( function(){
        $(this).val('');
    });

    $('.disaster-info input[type=checkbox]').each(function(){
        $(this).attr('checked', false);
    });

    $('.disaster-info textarea').val('');

    $("#disasterStartDate").datepicker('clearDates')
    $("#disasterEndDate").datepicker('clearDates')
}

function openleftBlock() {
    "use strict";

    $(".leftblock").addClass('in');
    $(".tab-selector-1").prop( "checked", true );
    $("button[dwmenu]").each(function () {
        $(this).attr('disabled', true);
    });

    ['#settings-panel', '#settings-btn', '#basemaps-panel', '#basemaps-btn', '#disasters-panel', '#disasters-btn'].forEach(function(e){
        $(e).removeClass('on');
    });

    map.resize();
    // getImages();
}

function editEvt(id) {
    openleftBlock();

    $(".tab-selector-2").prop( "checked", true);
    $(".tab-selector-1").attr('disabled', true);

    //fill
    var features = map.getSource("disasterdb")._data.features.filter(function(e){
        return (e.properties.uuid === id);
    });

    // geojson.properties.dtype = $('.disasterType').children().map(function(){
        // return this.className
    // }).toArray();

    document.getElementById("disasterName").value = features[0].properties.name;
    document.getElementById("disasterPlace").value = features[0].properties.place;
    $("#disasterStartDate").datepicker("setDate", features[0].properties.dateStart);
    if (features[0].properties.dateEnd === ''){
        document.getElementById("dateCheckbox").checked = true;
    } else {
        $("#disasterEndDate").datepicker("setDate", features[0].dateEnd);
    }

    document.getElementById("disasterComments").value = features[0].properties.comments.replace('<br/>', /\r?\n/g);
}

function closeleftblock() {
        $(".leftblock").removeClass('in');
        $("button[dwmenu]").each(function () {
            $(this).attr('disabled', false);
        });

        $(".tab-selector-1").prop( "checked", true );
        $(".tab-selector-1").attr('disabled', false);
        $(".tab-selector-2").attr('disabled', false);

        $('.img-preview').empty();
        resetForm();
        map.resize();
        draw.deleteAll();
}

////////////////////////////////////////////////////////////////////////////////
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
        $("#disastermailTo").attr('disabled', false);
    } else {
        $("#disastermailTo").attr('disabled', 'disabled');
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

function feeddownloadS2(elem, preview) {
    "use strict";
    var s2prefix = "http://sentinel-s2-l1c.s3.amazonaws.com/";
    $('#modalDownloadS2 .overview').attr('data-id', elem);
    $('#modalDownloadS2 .overview').attr('data-prev', preview);
    $('#modalDownloadS2 .dwn-bands').append(
        '<span>Direct Download S2 band (Right Click on link)</span>' +
            '<a id="b1" target="_blank" href="' + s2prefix + elem + '/B01.jp2" download>B1 - Coastal (60m)</a>' +
            '<a id="b2" target="_blank" href="' + s2prefix + elem + '/B02.jp2" download>B2 - Blue (10m)</a>' +
            '<a id="b3" target="_blank" href="' + s2prefix + elem + '/B03.jp2" download>B3 - Green (10m)</a>' +
            '<a id="b4" target="_blank" href="' + s2prefix + elem + '/B04.jp2" download>B4 - Red (10m)</a>' +
            '<a id="b5" target="_blank" href="' + s2prefix + elem + '/B05.jp2" download>B5 - Vegetation Classif 1 (20m)</a>' +
            '<a id="b6" target="_blank" href="' + s2prefix + elem + '/B06.jp2" download>B6 - Vegetation Classif 2 (20m)</a>' +
            '<a id="b7" target="_blank" href="' + s2prefix + elem + '/B07.jp2" download>B7 - Vegetation Classif 3 (20m)</a>' +
            '<a id="b8" target="_blank" href="' + s2prefix + elem + '/B08.jp2" download>B8 - Near Infrared (10m)</a>' +
            '<a id="b9" target="_blank" href="' + s2prefix + elem + '/B09.jp2" download>B9 - Water vapour (60m)</a>' +
            '<a id="b10" target="_blank" href="' + s2prefix + elem + '/B10.jp2" download>B10 - Cirrus (60m)</a>' +
            '<a id="b11" target="_blank" href="' + s2prefix + elem + '/B11.jp2" download>B11 - Thermal Infrared 1 (20m)</a>' +
            '<a id="b12" target="_blank" href="' + s2prefix + elem + '/B12.jp2" download>B12 - Thermal Infrared 2 (20m)</a>' +
            '<a id="mtl" target="_blank" href="' + s2prefix + elem + '/productInfo.json" download>Metadata</a>'
    );
    $('#modalDownloadS2 .overview').html('<img src="' + preview + '">');
    $('#modalDownloadS2').modal();
}

function feeddownloadL8(url, id) {
    "use strict";
    $('#modalDownloadL8 .overview').attr('data-id', id);
    $('#modalDownloadL8 .dwn-bands').append(
        '<span>Direct Download L8 band (Right Click on link)</span>' +
            '<a id="b1" target="_blank" href="' + url + id + '_B1.TIF" download>B1 - Coastal aerosol</a>' +
            '<a id="b2" target="_blank" href="' + url + id + '_B2.TIF" download>B2 - Blue</a>' +
            '<a id="b3" target="_blank" href="' + url + id + '_B3.TIF" download>B3 - Green</a>' +
            '<a id="b4" target="_blank" href="' + url + id + '_B4.TIF" download>B4 - Red</a>' +
            '<a id="b5" target="_blank" href="' + url + id + '_B5.TIF" download>B5 - Near Infrared</a>' +
            '<a id="b6" target="_blank" href="' + url + id + '_B6.TIF" download>B6 - Shortwave Infrared 1</a>' +
            '<a id="b7" target="_blank" href="' + url + id + '_B7.TIF" download>B7 - Shortwave Infrared 2</a>' +
            '<a id="b8" target="_blank" href="' + url + id + '_B8.TIF" download>B8 - Panchromatic (15m)</a>' +
            '<a id="b9" target="_blank" href="' + url + id + '_B9.TIF" download>B9 - Cirrus</a>' +
            '<a id="b10" target="_blank" href="' + url + id + '_B10.TIF" download>B10 - Thermal Infrared 1</a>' +
            '<a id="b11" target="_blank" href="' + url + id + '_B11.TIF" download>B11 - Thermal Infrared 2</a>' +
            '<a id="bQA" target="_blank" href="' + url + id + '_BQA.TIF" download>BQA - Quality Assessment</a>' +
            '<a id="mtl" target="_blank" href="' + url + id + '_MTL.txt" download>MTL - Metadata</a>'
    );

    var req = {
        scene: id,
        bands: "[4,3,2]"
    };

    $.post("https://npj2g2bwcc.execute-api.us-west-2.amazonaws.com/landsat/overview", JSON.stringify({info: req}))
        .done(function (data) {
            if (!(data.hasOwnProperty('errorMessage'))) {
                $('#modalDownloadL8 .overview').html('<img src="data:image/png;base64,' + data.data + '">');
            } else {
                $('#modalDownloadL8 .overview').html('<span>Preview Unavailable</span>');
            }
        })
        .fail(function () {
            $('#modalDownloadL8 .overview').html('<span>Preview Unavailable</span>');
        });
    $('#modalDownloadL8').modal();
}

$('#modalDownloadL8').on('hidden.bs.modal', function () {
    "use strict";
    $("#modalPreview").focus();
    $('#modalDownloadL8 .dwn-bands').empty();
    $('#modalDownloadL8 .overview').attr('data-id', '');
    $('#modalDownloadL8 .overview').html('<span><i class="fa fa-spinner fa-spin"></i></span>');

    $("#modalDownloadL8 .dropdown-menu li a").each(function (index, element) {
        $(element).removeClass('on');
    });
    $("#modalDownloadL8 .dropdown-menu li a").first().addClass("on");
    $("#modalDownloadL8 .dropdown .btn:first-child").html($("#modalDownloadL8 .dropdown-menu li a").first().text() + ' <span class="caret"></span>');
});

$('#modalDownloadS2').on('hidden.bs.modal', function () {
    "use strict";
    $("#modalPreview").focus();
    $('#modalDownloadS2 .dwn-bands').empty();
    $('#modalDownloadS2 .overview').attr('data-id', '');
    $('#modalDownloadS2 .overview').html('<span><i class="fa fa-spinner fa-spin"></i></span>');

    $("#modalDownloadS2 .dropdown-menu li a").each(function (index, element) {
        $(element).removeClass('on');
    });
    $("#modalDownloadS2 .dropdown-menu li a").first().addClass("on");
    $("#modalDownloadS2 .dropdown .btn:first-child").html($("#modalDownloadL8 .dropdown-menu li a").first().text() + ' <span class="caret"></span>');
});

$(function () {
    "use strict";

    $("#modalDownloadS2 .dropdown-menu li a").click(function () {
        $('#modalDownloadS2 .overview').html('<span><i class="fa fa-spinner fa-spin"></i></span>');
        $("#modalDownloadS2 .dropdown .btn:first-child").html($(this).text() + ' <span class="caret"></span>');

        var req = {
            path: $('#modalDownloadS2 .overview').attr("data-id"),
            bands: $(this).parent().attr("data-bands")
        };

        if (req.bands === "[4,3,2]") {
            var preview = $('#modalDownloadS2 .overview').attr("data-prev");
            $('#modalDownloadS2 .overview').html('<img src="' + preview + '">');
        } else {
            $.post("https://6bu43holc0.execute-api.eu-central-1.amazonaws.com/prod/sentinel2_ovr", JSON.stringify({info: req}))
                .done(function (data) {
                    if (!(data.hasOwnProperty('errorMessage'))) {
                        $('#modalDownloadS2 .overview').html('<img src="data:image/png;base64,' + data.data + '">');
                    } else {
                        $('#modalDownloadS2 .overview').html('<span>Preview Unavailable</span>');
                    }
                })
                .fail(function () {
                    $('#modalDownloadS2 .overview').html('<span>Preview Unavailable</span>');
                });
        }

        $("#modalDownloadS2 .dropdown-menu li a").each(function (index, element) {
            $(element).removeClass('on');
        });
        $(this).addClass('on');
    });
});

$(function () {
    "use strict";

    $("#modalDownloadL8 .dropdown-menu li a").click(function () {
        $('#modalDownloadL8 .overview').html('<span><i class="fa fa-spinner fa-spin"></i></span>');
        $("#modalDownloadL8 .dropdown .btn:first-child").html($(this).text() + ' <span class="caret"></span>');

        var req = {
            scene: $('#modalDownloadL8 .overview').attr("data-id"),
            bands: $(this).parent().attr("data-bands")
        };

        $.post("https://npj2g2bwcc.execute-api.us-west-2.amazonaws.com/landsat/overview", JSON.stringify({info: req}))
            .done(function (data) {
                if (!(data.hasOwnProperty('errorMessage'))) {
                    $('#modalDownloadL8 .overview').html('<img src="data:image/png;base64,' + data.data + '">');
                } else {
                    $('#modalDownloadL8 .overview').html('<span>Preview Unavailable</span>');
                }
            })
            .fail(function () {
                $('#modalDownloadL8 .overview').html('<span>Preview Unavailable</span>');
            });

        $("#modalDownloadL8 .dropdown-menu li a").each(function (index, element) {
            $(element).removeClass('on');
        });
        $(this).addClass('on');
    });
});

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

function mapFlyToDisaster(id) {
    "use strict";

    // var features = map.querySourceFeatures("disasterdb", {filter: ["==", "uuid", id]});
    var features = map.getSource("disasterdb")._data.features.filter(function(e){
        return (e.properties.uuid === id);
    });

    if (features){
        if (features[0].geometry.type === "Polygon") {
            var bbox = turf.extent(features[0].geometry);
            map.fitBounds(bbox, {padding: 20});
        }

        if (features[0].geometry.type === "Point") {
            var round = turf.buffer(features[0], 100, 'kilometers'),
                bbox = turf.extent(round);
            map.fitBounds(bbox, {padding: 20});
        }
    }
}

function removeEvt(id) {
    "use strict";

    $('.map .spin').removeClass('display-none');
    $.ajax ({
        url: "https://shqxykh2td.execute-api.us-west-2.amazonaws.com/v1/remove",
        type: "POST",
        data: JSON.stringify({"uuid": id}),
        dataType: "json",
        contentType: "application/json",
    })
    .success(function(data){
        getDisasterdb();
    })
    .always(function () {
        $('.map .spin').addClass('display-none');
    })
    .fail(function () {
        console.log('fail');
        // $('.img-preview').append('<span class="serv-error">Server Error: Please contact <a href="mailto:contact@remotepixel.ca">contact@remotepixel.ca</a></span>');
    });
}

////////////////////////////////////////////////////////////////////////////////
function getDisasterdb() {
    "use strict";
    $.getJSON('https://s3-us-west-2.amazonaws.com/remotepixel/data/disasterwatch/disasterdb.geojson')
        .done(function (data) {

            map.getSource('disasterdb').setData(data);

            $('.list-disasters').scrollTop(0);
            $('.list-disasters').empty();
            for(var i = 0; i < data.features.length; i++) {
                $('.list-disasters').append(
                    '<div class="list-element" target="_blank" onclick="mapFlyToDisaster(\'' + data.features[i].properties.uuid + '\')">'+
                        '<div class="col">' +
                            '<div class="disaster-descr"><span class="dtype ' + data.features[i].properties.dtype[0] + '">' + data.features[i].properties.dtype[0].slice(0,1) + '</span></div>' +
                            '<div class="disaster-descr">'+
                                '<span class="dtitle">'+ data.features[i].properties.name +'</span>' +
                                '<span class="dplace">' + data.features[i].properties.place + '</span>' +
                            '</div>' +
                        '</div>' +
                    '</div>');
            }
        });
}

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

                var iconName = 'marker';
                switch (e.categories[0].title) {
                    case 'Volcanoes':
                        iconName = 'volcano';
                        break;
                    default:
                        iconName = 'marker';
                }

                if (e.geometries.length > 1) {
                    for(var j = 0; j < e.geometries.length; j++) {
                        var feature = {};
                        feature.properties = {
                            'dtype': e.categories[0].title,
                            'id': e.id,
                            'description': e.description,
                            'code' : e.categories[0].id,
                            'link': e.link,
                            'sources' : JSON.stringify(e.sources),
                            'title' : e.title,
                            'icon' : iconName
                        };
                        feature.properties.date =  e.geometries[j].date;
                        feature.geometry = {'type': "Point", 'coordinates': e.geometries[j].coordinates};
                        geojson.features.push(feature);
                    }
                } else {
                    var feature = {};
                    feature.properties = {
                        'dtype': e.categories[0].title,
                        'id': e.id,
                        'description': e.description,
                        'code' : e.categories[0].id,
                        'link': e.link,
                        'sources' : JSON.stringify(e.sources),
                        'title' : e.title,
                        'icon' : iconName
                    };
                    feature.properties.date = e.geometries[0].date;
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
        $("#basemaps-panel .side-view-content").scrollTop(0);
        $('#settings-panel').removeClass('on');
        $('#settings-btn').removeClass('on');
        $('#disasters-panel').removeClass('on');
        $('#disasters-btn').removeClass('on');
        $('#basemaps-panel').toggleClass('on');
        $('#basemaps-btn').toggleClass('on');
        break;

    case 'settings':
        $('#basemaps-panel').removeClass('on');
        $('#basemaps-btn').removeClass('on');
        $('#disasters-panel').removeClass('on');
        $('#disasters-btn').removeClass('on');
        $('#settings-panel').toggleClass('on');
        $('#settings-btn').toggleClass('on');
        break;

    case 'disasterslist':
        $("#disasters-panel .side-view-content").scrollTop(0);
        $('#basemaps-panel').removeClass('on');
        $('#basemaps-btn').removeClass('on');
        $('#settings-panel').removeClass('on');
        $('#settings-btn').removeClass('on');
        $('#disasters-panel').toggleClass('on');
        $('#disasters-btn').toggleClass('on');
        break;

    case 'add':
        $('#settings-panel').removeClass('on');
        $('#settings-btn').removeClass('on');
        $('#basemaps-panel').removeClass('on');
        $('#basemaps-btn').removeClass('on');
        $('#disasters-panel').removeClass('on');
        $('#disasters-btn').removeClass('on');
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
    });

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

    // $("#disasterEndDate").attr('disabled', 'disabled');
    $("#slider").attr('disabled', 'disabled');

    $('#modalUnderConstruction').modal();
});
