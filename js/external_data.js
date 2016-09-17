/*jslint browser: true*/
/*global $, jQuery, alert*/
/*global mapboxgl, mapboxgl, alert*/
/*global moment, moment, alert*/
/*global console, console, alert*/

// Load/Search External Data :
//  - earthquakes
//  - EONET events
//  - Disaster database
//  - Landsat/Sentinel Images

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

            for (var i = 0; i < data.events.length; i++) {
                var e = data.events[i],
                    iconName = 'marker';
                switch (e.categories[0].title) {
                case 'Volcanoes':
                    iconName = 'volcano';
                    break;
                default:
                    iconName = 'marker';
                }

                if (e.geometries.length > 1) {
                    for (var j = 0; j < e.geometries.length; j++) {
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

function getImages() {
    "use strict";

    $('.disaster-images .spin').removeClass('display-none');
    $('.map .spin').removeClass('display-none');
    $('.img-preview').empty();

    //Need to modulateGeometry
    var features = draw.getAll();
    if (features.features[0].geometry.type === "Point") {
        var ll = mapboxgl.LngLat.convert(features.features[0].geometry.coordinates).wrap().toArray();
        features.features[0].geometry.coordinates = ll;
    } else {
        features.features[0].geometry.coordinates[0] = features.features[0].geometry.coordinates[0].map(function(e){
            return mapboxgl.LngLat.convert(e).wrap().toArray();
        })
    }

    var sat_api = 'https://api.developmentseed.org/satellites',
        jsonObj = {
            intersects: features.features[0],
            date_from: "2016-01-01",
            date_to: moment.utc().format('YYYY-MM-DD'),
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
// Load Events and See Images
function seeEQimages(urlusgs){
    "use strict";

    $('.map .spin').removeClass('display-none');

    draw.deleteAll();

    if (draw.getMode() !== 'static'){
        draw.changeMode('static');
    }

    $.get("https://u4h2tjydjl.execute-api.us-west-2.amazonaws.com/remotepixel/https?url=" + urlusgs)
        .done(function (data) {
            var featureId = draw.add(data.geometry),
                features = draw.getAll();

            if (features.features[0].geometry.type === "Point") {
                var round = turf.buffer(features.features[0], 100, 'kilometers'),
                    bbox = turf.extent(round);
                map.fitBounds(bbox, {padding: 20});
            }

            $(".tab-selector-1").addClass('out');
            $(".tab-selector-2").addClass('out');
            openleftBlock();
            getImages();
        });
}

function seeEONETimages(id){
    "use strict";

    $('.map .spin').removeClass('display-none');

    draw.deleteAll();
    if (draw.getMode() !== 'static'){
        draw.changeMode('static');
    }
    var url = 'http://eonet.sci.gsfc.nasa.gov/api/v2.1/events/' + id;

    $.get("https://u4h2tjydjl.execute-api.us-west-2.amazonaws.com/remotepixel/https?url=" + url)
        .done(function (data) {

            if (data.geometries.length > 1) {
                var feature = { "type": 'LineString', "coordinates": []};
                for(var j = 0; j < data.geometries.length; j++) {
                    feature.coordinates.push(data.geometries[j].coordinates)
                }
            } else {
                var feature = { "type": 'Point', "coordinates": data.geometries[0].coordinates};
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

            $(".tab-selector-1").addClass('out');
            $(".tab-selector-2").addClass('out');
            openleftBlock();
            getImages();
        });
}
