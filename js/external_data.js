/*jslint browser: true*/
/*global $, jQuery, alert*/
/*global map, map, alert*/
/*global mapboxgl, mapboxgl, alert*/
/*global draw, draw, alert*/
/*global moment, moment, alert*/
/*global console, console, alert*/
/*global d3, d3, alert*/

// Load/Search External Data :
//  - earthquakes
//  - EONET events
//  - Disaster database
//  - Landsat/Sentinel Images

function getEarthquake() {
    "use strict";
    var urlusgs = 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson';
    $.get("https://i5njsxz8fk.execute-api.us-west-2.amazonaws.com/prod/toHTTPS?url=" + urlusgs)
        .done(function (data) {
            map.getSource('earthquakes').setData(JSON.parse(data));
        });
}

// function getVolcanoes() {
//     'use strict';
//     $.getJSON('https://data.remotepixel.ca/disasterwatch/ActiveVolcanoes.geojson')
//         .done(function (data) {
//             map.getSource('volcanoes').setData(data);
//         });
// }

function getEONETEvents() {
    "use strict";
    var eoneturl = 'http://eonet.sci.gsfc.nasa.gov/api/v2.1/events';
    $.get("https://u4h2tjydjl.execute-api.us-west-2.amazonaws.com/remotepixel/https?url=" + eoneturl)
        .done(function (data) {

            var geojson = {
                "type": "FeatureCollection",
                "features": []
            },
                i,
                j;

            for (i = 0; i < data.events.length; i++) {
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
                    for (j = 0; j < e.geometries.length; j++) {
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

function getL8S2Images(feature, callback) {
    "use strict";

    var sat = $.map($(".disaster-images .sat-filter input:checked"), function (e) {
        return e.getAttribute('data');
    });

    var jsonRequest = {
            intersects: feature,
            date_from: "2016-01-01",
            date_to: moment.utc().format('YYYY-MM-DD'),
            limit: 2000
        },
        results = [];

    $.ajax({
        url: 'https://api.developmentseed.org/satellites/',
        type: "POST",
        data: JSON.stringify(jsonRequest),
        dataType: "json",
        contentType: "application/json"
    })
        .success(function (data) {
            if (data.hasOwnProperty('errorMessage')) {
                $('.disaster-images .api-status .sat-api-status').addClass('on');
                console.log('DevSeed Sat-API servers Error');
                return callback(null);
            }
            if (data.meta.found !== 0) {
                var scene = {};

                for (var i = 0; i < data.results.length; i += 1) {
                    scene = {};
                    scene.date = data.results[i].date;
                    scene.cloud = data.results[i].cloud_coverage;
                    scene.sceneID = data.results[i].scene_id;

                    if (data.results[i].satellite_name === 'landsat-8') {
                        scene.sat = 'landsat-8';
                        scene.path = data.results[i].path.toString();
                        scene.row = data.results[i].row.toString();
                        scene.grid = data.results[i].path + '/' + data.results[i].row;
                        scene.usgsURL = data.results[i].cartURL;
                        scene.browseURL = data.results[i].browseURL.replace('http://', "https://");
                        scene.AWSurl = 'http://landsat-pds.s3.amazonaws.com/L8/' + zeroPad(data.results[i].path, 3) + '/' + zeroPad(data.results[i].row, 3) + '/' + data.results[i].sceneID + '/';
                        scene.sumAWSurl = 'https://landsatonaws.com/L8/' + zeroPad(data.results[i].path, 3) + '/' + zeroPad(data.results[i].row, 3) + '/' + data.results[i].sceneID;
                        results.push(scene);
                    } else {
                        scene.sat = 'sentinel-2';
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
            }

            for (var i = 0; i < results.length; i += 1) {

                var imgMeta = results[i],
                    className;

                if (imgMeta.sat === 'landsat-8') {

                    if (sat.indexOf('landsat8') === -1) {
                        className = 'item display-none';
                    } else {
                        className = 'item';
                    }

                    var hoverstr = "['all', ['==', 'PATH', " + imgMeta.path + "], ['==', 'ROW', " + imgMeta.row + "]]";
                    $('.img-preview').append(
                        '<div sat="landsat8" img-date="' + imgMeta.date + '" class="' + className + '" onmouseover="hoverL8(' + hoverstr + ')" onmouseout="hoverL8(' + "['all', ['==', 'PATH', ''], ['==', 'ROW', '']]" + ')">' +
                            '<img class="img-item img-responsive lazy lazyload" data-src="' + imgMeta.browseURL + '">' +
                            '<div class="result-overlay">' +
                                '<span>' + imgMeta.sceneID + '</span>' +
                                '<span><i class="fa fa-calendar-o"></i> ' + imgMeta.date + '</span>' +
                                '<span><i class="fa fa-cloud"></i> ' + imgMeta.cloud + '%</span>' +
                                '<span>Link:</span>' +
                                '<div class="btnDD" onclick="feeddownloadL8(\'' + imgMeta.AWSurl + '\',\'' + imgMeta.sceneID + '\')"><i class="fa fa-download"></i></div>' +
                                // '<a target="_blank" href="' + imgMeta.AWSurl + 'index.html"><img src="/img/aws.png"> </a>' +
                                '<a target="_blank" href="' + imgMeta.sumAWSurl + '"><img src="/img/aws.png"> </a>' +
                                '<a target="_blank" href="' + imgMeta.usgsURL + '"><img src="/img/usgs.jpg"></a>' +
                            '</div>' +
                            '</div>'
                    );
                } else {
                    if (sat.indexOf('sentinel2') === -1) {
                        className = 'item display-none';
                    } else {
                        className = 'item';
                    }
                    var hoverstr = "['==', 'Name', '" + imgMeta.grid + "']";
                    $('.img-preview').append(
                        '<div sat="sentinel2" img-date="' + imgMeta.date + '" class="' + className + '" onmouseover="hoverS2(' + hoverstr + ')" onmouseout="hoverS2(' + "['in', 'Name', '']" + ')">' +
                            '<img class="img-item img-responsive lazy lazyload" data-src="' + imgMeta.browseURL + '">' +
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

            return callback(null, results.length);
        })
        .fail(function () {
            $('.disaster-images .api-status .sat-api-status').addClass('on');
            console.log('DevSeed Sat-API servers Error');
            return callback(null);
        });
}

function getS1Images(feature, callback) {
    "use strict";

    var sat = $.map($(".disaster-images .sat-filter input:checked"), function (e) {
        return e.getAttribute('data');
    });

    var jsonRequest = {
            start_date: "2016-01-01",
            end_date: moment.utc().format('YYYY-MM-DD'),
            productType: 'SLC',
            maxRecords: 200
        },
        results = [];

    if (feature.geometry.type === "Point") {
        jsonRequest.lat = feature.geometry.coordinates[1];
        jsonRequest.lon = feature.geometry.coordinates[0];
    } else {
        var bbox = turf.bbox(feature);
        jsonRequest.box = bbox[0] + ',' + bbox[1] + ',' + bbox[2] + ',' + bbox[3];
    }

    $.ajax({
        url: 'https://yrj49dw0zg.execute-api.us-west-2.amazonaws.com/prod/api/getS1Images',
        type: "POST",
        data: JSON.stringify(jsonRequest),
        dataType: "json",
        contentType: "application/json"
    })
    .success(function(data){

        if (data.hasOwnProperty('errorMessage')) {
            $('.disaster-images .api-status .peps-status').addClass('on');
            console.log('DisasterWatch API servers Error');
            return callback(null);
        }

        var geojsonS1 = {
                "type": "FeatureCollection",
                "features": []
            };

        for (var i = 0; i < data.results.length; i += 1) {

            var imgMeta = data.results[i],
                className;

            var feat = {
                properties: {"id": imgMeta.sceneID},
                type: "Feature",
                geometry: imgMeta.geometry
            };
            geojsonS1.features.push(feat);

            if (sat.indexOf('sentinel1') === -1) {
                className = 'item display-none';
            } else {
                className = 'item';
            }

            var hoverstr = "['in', 'id', '" + imgMeta.sceneID + "']";
            $('.img-preview').append(
                '<div sat="sentinel1" img-date="' + imgMeta.date + '" class="' + className + '" onmouseover="hoverS1(' + hoverstr + ')" onmouseout="hoverS1(' + "['==', 'id', '']" + ')">' +
                    '<img class="img-item img-responsive lazy lazyload" data-src="' + imgMeta.browseURL + '">' +
                    '<div class="result-overlay">' +
                        '<span> S1A_IW_SLC' + moment(imgMeta.fullDate).utc().format('YYYYMMDD_hhmmss') + '</span>' +
                        '<span><i class="fa fa-calendar-o"></i> ' + imgMeta.date + '</span>' +
                        '<span><i class="ms ms-satellite"></i> ' + imgMeta.orbType.slice(0,4) + ' | ' + imgMeta.refOrbit + '</span>' +
                        '<span> Pol: ' + imgMeta.polarisation + ' | SLC </span>' +
                        '<span>Link:</span>' +
                        '<a target="_blank" href="' + imgMeta.pepsURL + '"><img src="/img/peps.png"> </a>' +
                    '</div>' +
                    '</div>'
            );
        }
        map.getSource('sentinel-1').setData(geojsonS1);

        return callback(null, data.length);
    })
    .fail(function(err) {
        $('.disaster-images .api-status .peps-status').addClass('on');
        console.log('DisasterWatch API servers Error');
        return callback(null);
    });
}

function getImages() {
    "use strict";
    $('.disaster-images .api-status .status').removeClass('on');
    $('.disaster-images .spin-load').removeClass('display-none');
    $('.img-preview').empty();

    //Need to modulateGeometry
    var features = draw.getAll();
    if (features.features[0].geometry.type === "Point") {
        var ll = mapboxgl.LngLat.convert(features.features[0].geometry.coordinates).wrap().toArray();
        features.features[0].geometry.coordinates = ll;
    } else {
        features.features[0].geometry.coordinates[0] = features.features[0].geometry.coordinates[0].map(function (e) {
            return mapboxgl.LngLat.convert(e).wrap().toArray();
        });
    }

    var q = d3.queue()
        .defer(getL8S2Images, features.features[0])
        .defer(getS1Images, features.features[0])
        .awaitAll(function(error, images) {
            $('.disaster-images .spin-load').addClass('display-none');
            sortListImage();

            if (!images[0] && !images[1]) {
                $('.img-preview').append('<div class="serv-error">' +
                    '<span>Error: Cannot connect to APIs</span>' +
                    '<div class="center-block"><button class="btn btn-default" onclick="getImages()">Retry</button></div>'
                );
            } else {
                var results = 0;
                if (images.length !== 0) {
                    for (var j = 0; j <images.length; j++) {
                        if (images[j]) {
                            results += images[j];
                        }
                    }
                }

                if (results === 0) {
                    $('.img-preview').append('<span class="nodata-error">No image found</span>');
                }
                // else {
                //     filterListImage();
                // }
            }
        });
}

////////////////////////////////////////////////////////////////////////////////
// Load Events and See Images
function seeEQimages(urlusgs) {
    "use strict";

    $('.map .spin').removeClass('display-none');

    draw.deleteAll();

    if (draw.getMode() !== 'static') {
        draw.changeMode('static');
    }

    $.get("https://u4h2tjydjl.execute-api.us-west-2.amazonaws.com/remotepixel/https?url=" + urlusgs)
        .done(function (data) {
            var featureId = draw.add(data.geometry),
                features = draw.getAll();

            if (features.features[0].geometry.type === "Point") {
                var round = turf.buffer(features.features[0], 100, 'kilometers'),
                    bbox = turf.bbox(round);
                map.fitBounds(bbox, {padding: 20});
            }

            addType(document.getElementById('dropdown-menu').getElementsByClassName('earthquake')[0].parentElement);

            document.getElementById("disasterName").value = data.properties.title;
            document.getElementById("disasterPlace").value = data.properties.place;
            document.getElementById("disasterStartDate").value = moment(data.properties.time).utc().format('YYYY-MM-DD');
            document.getElementById("disasterEndDate").value = moment(data.properties.time).utc().format('YYYY-MM-DD');
            document.getElementById("disasterComments").value = data.properties.url;

            openleftBlock();
            getImages();
            $('.map .spin').addClass('display-none');
        });
    closePopup();
}

function seeEONETimages(id) {
    "use strict";

    $('.map .spin').removeClass('display-none');

    draw.deleteAll();
    if (draw.getMode() !== 'static') {
        draw.changeMode('static');
    }
    var url = 'http://eonet.sci.gsfc.nasa.gov/api/v2.1/events/' + id;

    $.get("https://u4h2tjydjl.execute-api.us-west-2.amazonaws.com/remotepixel/https?url=" + url)
        .done(function (data) {

            if (data.geometries.length > 1) {
                var feature = { "type": 'LineString', "coordinates": []},
                    j;
                for (j = 0; j < data.geometries.length; j++) {
                    feature.coordinates.push(data.geometries[j].coordinates);
                }
            } else {
                var feature = { "type": 'Point', "coordinates": data.geometries[0].coordinates};
            }

            var featureId = draw.add(feature),
                features = draw.getAll();

            if (features.features[0].geometry.type === "LineString") {
                var bbox = turf.bbox(features.features[0].geometry);
                map.fitBounds(bbox, {padding: 20});
            }

            if (features.features[0].geometry.type === "Point") {
                var round = turf.buffer(features.features[0], 100, 'kilometers'),
                    bbox = turf.bbox(round);
                map.fitBounds(bbox, {padding: 20});
            }

            // addType(document.getElementById('dropdown-menu').getElementsByClassName('earthquake')[0].parentElement);
            //
            // document.getElementById("disasterName").value = data.properties.title;
            // document.getElementById("disasterPlace").value = data.properties.place;
            // document.getElementById("disasterStartDate").value = moment(data.properties.time).utc().format('YYYY-MM-DD');
            // document.getElementById("disasterEndDate").value = moment(data.properties.time).utc().format('YYYY-MM-DD');
            // document.getElementById("disasterComments").value = data.properties.url;

            $(".tab-selector-1").addClass('out');
            $(".tab-selector-2").addClass('out');
            openleftBlock();
            getImages();
            $('.map .spin').addClass('display-none');
        });
    closePopup();
}

$("#s1-checkbox").change(function () {
    "use strict";
    $("#s1-checkbox").parent().toggleClass('green');
});
