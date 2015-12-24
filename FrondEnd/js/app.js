/*jslint browser: true*/
/*global $, jQuery, alert*/
/*global L, lealfet, alert*/
/*global moment, moment, alert*/
/*global console, console, alert*/

var locDate = new Date(),
    utcDate = new Date(locDate.getTime() + (locDate.getTimezoneOffset() * 60000)),
    scope = {
        basemap: "mapbox",
        current_date: moment(locDate).format('YYYY-MM-DD')
    },
    avail_basemap = {
        'VIIRS_SNPP_CorrectedReflectance_TrueColor' : 'SUOMI NPP True Color (CR)',
        'VIIRS_SNPP_CorrectedReflectance_BandsM11-I2-I1' : 'SUOMI NPP Bands M11-I2-I1 (CR)',
        'VIIRS_SNPP_CorrectedReflectance_BandsM3-I3-M11' : 'SUOMI NPP Bands M3-I3-I11 (CR)',
        'MODIS_Terra_CorrectedReflectance_TrueColor': 'Terra True Color (CR)',
        'MODIS_Terra_CorrectedReflectance_Bands721': 'Terra Bands 7-2-1 (CR)',
        'MODIS_Terra_CorrectedReflectance_Bands367': 'Terra Bands 3-6-7 (CR)',
        'MODIS_Aqua_CorrectedReflectance_TrueColor': 'Aqua True Color (CR)',
        'MODIS_Aqua_CorrectedReflectance_Bands721': 'Aqua Bands 7-2-1 (CR)',
        'MODIS_Terra_Land_Surface_Temp_Day': 'Terra Surface T° (Day)',
        'MODIS_Terra_Land_Surface_Temp_Night': 'Terra Surface T° (Night)',
        'MODIS_Aqua_Land_Surface_Temp_Day': 'Aqua Surface T° (Day)',
        'MODIS_Aqua_Land_Surface_Temp_Night': 'Aqua Surface T° (Night)',
        'mapbox': 'mapbox'
    };

// Create a basemap
var map = L.map('map', {
    zoomControl: false,
    attributionControl: false,
    scrollWheelZoom: true,
    inertia: false,
    minZoom: 2,
    maxZoom: 9
}),
    icon_inactive = L.icon({
        iconUrl: '../img/volcano_rest.png',
        iconAnchor: [10, 40],
        iconSize: [20, 40]
    }),
    icon_warning = L.icon({
        iconUrl: '../img/volcano_warn.png',
        iconAnchor: [20, 80],
        iconSize: [40, 80]
    }),
    icon_active = L.icon({
        iconUrl: '../img/volcano_act.png',
        iconAnchor: [20, 80],
        iconSize: [40, 80]
    }),
    volcanoesGroup = new L.featureGroup().addTo(map),
    seismesGroup = new L.featureGroup().addTo(map),
    fireGroup = new L.layerGroup(),
    lyrGr = new L.layerGroup().addTo(map);

L.control.attribution({prefix: "<a href='http://remotepixel.ca/' target='_blank'>&copy; RemotePixel", position: 'bottomright'}).addTo(map);

fireGroup.addLayer(L.tileLayer.wms("https://firms.modaps.eosdis.nasa.gov/wms/", {
    layers: 'fires24',
    format: 'image/PNG',
    transparent: true,
    zIndex: 100000,
    attribution: ""
}));

volcanoesGroup.on('click', function (e) {
    'use strict';
    e.layer.bindPopup(
        '<div class="nom-eq">Name: ' + e.layer.properties.Name + '</div>' +
            '<div class="linetab">Status: ' + e.layer.properties.vw.status + '</div>' +
            '<div class="linetab">Last Update: ' + e.layer.properties.vw.update + '</div>' +
            '<div class="linetab">Sources: ' + e.layer.properties.vw.sources + '</div>' +
            '<div class="linetab">Volcano Type: ' + e.layer.properties.Type + '</div>' +
            '<div class="linetab">Volcano Num: ' + e.layer.properties.Number + '</div>' +
            '<div class="linetab">Elevation: ' + e.layer.properties.Elevation + 'm</div>' +
            '<div class="linetab">Country: ' + e.layer.properties.Country + '</div>' +
            '<div class="linetab"><a target="_blank" href="http://volcano.si.edu/volcano.cfm?vn=' + e.layer.properties.Number + '">Info</a></div>'
    ).openPopup();
});

seismesGroup.on('click', function (e) {
    'use strict';
    console.log(e.layer.properties);
    e.layer.bindPopup(
        '<div class="nom-eq">Name: ' + e.layer.properties.title + '</div>' +
            '<div class="linetab">Date: ' + moment(e.layer.properties.time).utc().format('YYYY-MM-DD HH:mm:ss') + '(UTC)</div>' +
            '<div class="linetab">Magnitude: ' + e.layer.properties.mag + '</div>' +
            '<div class="linetab">Felt: ' + ((e.layer.properties.felt === null) ? 'No' : 'Yes') + '</div>' +
            '<div class="linetab">Duration (min): ' + e.layer.properties.dmin + '</div>' +
            '<div class="linetab">Tsunami: ' + ((e.layer.properties.tsunami === 0) ? 'No' : 'Yes') + '</div>' +
            '<div class="linetab"><a target="_blank" href="' + e.layer.properties.url + '">Info</a></div>'
    ).openPopup();
});

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: "Map Data: <a href='http://www.mapbox.com/about/maps/' target='_blank'>&copy; Mapbox &copy; OpenStreetMap</a>",
    id: 'vincentsarago.3a6fdab2',
    accessToken: 'pk.eyJ1IjoidmluY2VudHNhcmFnbyIsImEiOiIwMjYwZDQ3ZDVhZGM2ZjQzNzg2MTQzY2I2NjA1ZjU2ZCJ9.eTehNUtH3zlcrTbTUQ-fdg'
}).addTo(map);

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
var j,
    option;

for (j = 0; j < volcanoes.length; j += 1) {
    if (volcanoes[j].vw.active === 0) continue;
    switch (volcanoes[j].vw.status){
    case 'inactive':
        option =  {icon: icon_inactive, title: volcanoes[j].Name};
        break;

    case 'warning':
        option =  {icon: icon_warning, title: volcanoes[j].Name};
        break;

    case 'active':
        option =  {icon: icon_active, title: volcanoes[j].Name};
        break;

    case null:
        option =  {icon: icon_inactive, title: volcanoes[j].Name};
        break;
    }
    var vol = L.marker([volcanoes[j].Lat, volcanoes[j].Lon], option);
    vol.properties = volcanoes[j];
    volcanoesGroup.addLayer(vol);
}

new L.Control.Zoom({position: 'bottomright'}).addTo(map);

map.setView([0, 0], 2);
// random volcanoes locations

// MINI Maps
var mini_map_option = {
        zoom: 2,
        keyboard: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        dragging: false,
        tap: false,
        attributionControl: false,
        zoomControl: false,
        inertia: false,
        minZoom: 2,
        maxZoom: 10,
        center: [1, 1]
    };

var minimap0 = L.map('map-default', mini_map_option);
minimap0.dragging.disable();

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    id: 'vincentsarago.3a6fdab2',
    accessToken: 'pk.eyJ1IjoidmluY2VudHNhcmFnbyIsImEiOiJjaWlleG1vdmowMWhydGtrc2xqcmQzNmhlIn0.80HAFLCQ6yUWCk4mwm6zbw'
}).addTo(minimap0);
map.sync(minimap0);

var minimap1 = L.map('map-terra-true', mini_map_option);
//minimap1.dragging.disable();
map.sync(minimap1);
var minimap1_lyr = L.layerGroup().addTo(minimap1);

var minimap2 = L.map('map-terra-721', mini_map_option);
//minimap2.dragging.disable();
map.sync(minimap2);
var minimap2_lyr = L.layerGroup().addTo(minimap2);

var minimap3 =  L.map('map-terra-367', mini_map_option);
//minimap3.dragging.disable();
map.sync(minimap3);
var minimap3_lyr = L.layerGroup().addTo(minimap3);

var minimap4 = L.map('map-aqua-true', mini_map_option);
//minimap4.dragging.disable();
map.sync(minimap4);
var minimap4_lyr = L.layerGroup().addTo(minimap4);

var minimap5 = L.map('map-aqua-721', mini_map_option);
//minimap5.dragging.disable();
map.sync(minimap5);
var minimap5_lyr = L.layerGroup().addTo(minimap5);

var minimap6 = L.map('map-suomi-true', mini_map_option);
//minimap6.dragging.disable();
map.sync(minimap6);
var minimap6_lyr = L.layerGroup().addTo(minimap6);

var minimap7 = L.map('map-suomi-1121', mini_map_option);
//minimap7.dragging.disable();
map.sync(minimap7);
var minimap7_lyr = L.layerGroup().addTo(minimap7);

var minimap8 = L.map('map-suomi-3311', mini_map_option);
//minimap8.dragging.disable();
map.sync(minimap8);
var minimap8_lyr = L.layerGroup().addTo(minimap8);

$("#earthquake-checkbox").change(function () {
    "use strict";
    $("#earthquake-checkbox").parent().toggleClass('green');
    if (map.hasLayer(seismesGroup)) {
        map.removeLayer(seismesGroup);
    } else {
        map.addLayer(seismesGroup);
    }
});

$("#fire-checkbox").change(function () {
    "use strict";
    $("#fire-checkbox").parent().toggleClass('green');
    if (map.hasLayer(fireGroup)) {
        map.removeLayer(fireGroup);
    } else {
        map.addLayer(fireGroup);
    }
});

$("#volcanoes-checkbox").change(function () {
    "use strict";
    $("#volcanoes-checkbox").parent().toggleClass('green');
    if (map.hasLayer(volcanoesGroup)) {
        map.removeLayer(volcanoesGroup);
    } else {
        map.addLayer(volcanoesGroup);
    }
});

function getSeismes() {
    "use strict";
    seismesGroup.clearLayers();
    var urlusgs = 'http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=' + scope.current_date + '&endtime=' + moment(scope.current_date, 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD');
    $.getJSON(urlusgs, function (data) {
        data.features.forEach(function (e) {
            var feat = L.circleMarker([e.geometry.coordinates[1], e.geometry.coordinates[0]], {
                "color": "#3b74f2",
                "radius": e.properties.mag * 2,
                "weight": 2,
                "opacity": 1,
                "fill": true
            });
            feat.properties = e.properties;
            seismesGroup.addLayer(feat);
        });
    });
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

function changeOverlay(lyr_name) {
    'use strict';

    scope.basemap = lyr_name;
    lyrGr.clearLayers();
    if (scope.basemap !== 'mapbox') {
        lyrGr.addLayer(L.GIBSLayer(scope.basemap, {date: scope.current_date, transparent: true, attribution: 'Imagery: <a href="https://earthdata.nasa.gov/gibs">NASA EOSDIS GIBS</a>'}));
        lyrGr.addLayer(L.GIBSLayer('Coastlines', {zIndex: 1000}));
    }
    $("#right-id").text("Right: " + avail_basemap[scope.right_data]);
}

function updateminimap() {
    'use strict';
    var modis_option = {date: scope.current_date, transparent: scope.transparent_modis};
    minimap1_lyr.clearLayers();
    minimap2_lyr.clearLayers();
    minimap3_lyr.clearLayers();
    minimap4_lyr.clearLayers();
    minimap5_lyr.clearLayers();
    minimap6_lyr.clearLayers();
    minimap7_lyr.clearLayers();
    minimap8_lyr.clearLayers();
    minimap1_lyr.addLayer(L.GIBSLayer('MODIS_Terra_CorrectedReflectance_TrueColor', modis_option));
    minimap2_lyr.addLayer(L.GIBSLayer('MODIS_Terra_CorrectedReflectance_Bands721', modis_option));
    minimap3_lyr.addLayer(L.GIBSLayer('MODIS_Terra_CorrectedReflectance_Bands367', modis_option));
    minimap4_lyr.addLayer(L.GIBSLayer('MODIS_Aqua_CorrectedReflectance_TrueColor', modis_option));
    minimap5_lyr.addLayer(L.GIBSLayer('MODIS_Aqua_CorrectedReflectance_Bands721', modis_option));
    minimap6_lyr.addLayer(L.GIBSLayer('VIIRS_SNPP_CorrectedReflectance_TrueColor', modis_option));
    minimap7_lyr.addLayer(L.GIBSLayer('VIIRS_SNPP_CorrectedReflectance_BandsM11-I2-I1', modis_option));
    minimap8_lyr.addLayer(L.GIBSLayer('VIIRS_SNPP_CorrectedReflectance_BandsM3-I3-M11', modis_option));
}

$(document).ready(function () {
    "use strict";
    getSeismes();

    $(".date-button").text(scope.current_date);
    updateminimap();

    $(".date-button").datepicker({
        format : 'mm/dd/yyyy',
        autoclose : true,
        todayHighlight : true,
        startDate : new Date('2012-05-08'),
        endDate : utcDate
    }).on('changeDate', function (e) {
        scope.current_date = moment(e.date).format('YYYY-MM-DD');
        $(".date-button").text(scope.current_date);
        changeOverlay(scope.basemap);
        updateminimap();
    });

});
