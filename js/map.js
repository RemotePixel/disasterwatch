'use strict';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

var map = new mapboxgl.Map({
    container: 'map',
    center: [0, 10],
    zoom: 1,
    style: 'mapbox://styles/vincentsarago/ciuknp8en007g2io2qc4bbh7x',
    attributionControl: false,
    minZoom: 0,
    maxZoom: 8
});

// map.dragRotate.disable();
// map.touchZoomRotate.disableRotation();
// map.addControl(new mapboxgl.NavigationControl(), 'top-left');

map.addControl(new mapboxgl.NavigationControl(), 'top-left');
map.addControl(new mapboxgl.AttributionControl({compact: true}), 'bottom-right');

const arbitraryDOMNode = document.getElementsByClassName('geocoder-container')[0];
const geocoder = new MapboxGeocoder({accessToken: mapboxgl.accessToken });
arbitraryDOMNode.appendChild(geocoder.onAdd(map));

const draw = new MapboxDraw({displayControlsDefault: false});
map.addControl(draw);

const btnsearch = document.createElement('button');
btnsearch.className = 'mapboxgl-ctrl-icon';
btnsearch.setAttribute('onclick', 'toggleSearch()');
const icnsearch = document.createElement('i');
icnsearch.className = 'fa fa-search ';
btnsearch.appendChild(icnsearch);

var grp = document.createElement('div');
grp.className = 'mapboxgl-ctrl-group mapboxgl-ctrl';
grp.appendChild(btnsearch);

var control = document.getElementsByClassName('mapboxgl-ctrl-top-left');
control[0].appendChild(grp.cloneNode(true));

map.on('load', function () {

    const geojson = {
        'type': 'FeatureCollection',
        'features': []
    };

    //Landsat 8 Layer
    map.addSource('landsat', {
        'type': 'vector',
        'url': 'mapbox://vincentsarago.8ib6ynrs'
    });
    map.addLayer({
        'id': 'l8-highlighted',
        'type': 'fill',
        'source': 'landsat',
        'source-layer': 'Landsat8_Desc_filtr2',
        'paint': {
            'fill-outline-color': '#1386af',
            'fill-color': '#0f6d8e',
            'fill-opacity': 0.3
        },
        'filter': ['in', 'PATH', '']
    });

    //Sentinel 2 Layer
    map.addSource('sentinel2', {
        'type': 'vector',
        'url': 'mapbox://vincentsarago.0qowxm38'
    });
    map.addLayer({
        'id': 's2-highlighted',
        'type': 'fill',
        'source': 'sentinel2',
        'source-layer': 'Sentinel2_Grid',
        'paint': {
            'fill-outline-color': '#1386af',
            'fill-color': '#0f6d8e',
            'fill-opacity': 0.3
        },
        'filter': ['in', 'Name', '']
    });

    map.addSource('sentinel-1', {
        'type': 'geojson',
        'data': geojson
    });

    map.addLayer({
        'id': 's1-highlighted',
        'type': 'fill',
        'source': 'sentinel-1',
        'paint': {
            'fill-outline-color': '#1386af',
            'fill-color': '#0f6d8e',
            'fill-opacity': 0.3
        },
        'filter': ['==', 'id', '']
    });

    // DisasterDB
    map.addSource('disasterdb', {
        'type': 'geojson',
        'data': geojson
    });

    map.addLayer({
        'id': 'disasterdb-points',
        'type': 'symbol',
        'source': 'disasterdb',
        'layout': {
            'symbol-placement': 'point',
            'icon-image': 'dw-{icon}-15',
            'icon-allow-overlap': true,
            'icon-size': {
                'base': 1,
                'stops': [
                    [0, 1.2],
                    [9, 1]
                ]
            }
        }
    });

    map.addLayer({
        'id': 'disasterdb-lines',
        'type': 'line',
        'source': 'disasterdb',
        'filter': ['==', '$type', 'LineString'],
        'paint': {
            'line-color': '#454545',
            'line-width': 2,
            'line-opacity': {
                'base': 1,
                'stops': [
                    [0, 1],
                    [9, 0.1]
                ]
            }
        }
    });

    map.addLayer({
        'id': 'disasterdb-polygons',
        'type': 'fill',
        'source': 'disasterdb',
        'filter': ['==', '$type', 'Polygon'],
        'paint': {
            'fill-outline-color': '#454545',
            'fill-color': '#454545',
            'fill-opacity': {
                'base': 1,
                'stops': [
                    [0, 1],
                    [9, 0.1]
                ]
            }
        }
    }, 'disasterdb-points');

    // USGS Latest EarthQuakes
    map.addSource('earthquakes', {
        'type': 'geojson',
        'data': geojson
    });

    map.addLayer({
        'id': 'earthquakes-blur',
        'type': 'circle',
        'source': 'earthquakes',
        'maxzoom': 9,
        'layout': {'visibility' : 'none'},
        'paint': {
            'circle-opacity': 0.8,
            'circle-radius': {
                'property': 'mag',
                'base': 1.8,
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
                    [4.5, '#fff'],
                    [8, '#f00']
                ]
            }
        }
    });

    map.addLayer({
        'id': 'earthquakes-point',
        'type': 'circle',
        'source': 'earthquakes',
        'layout': {'visibility' : 'none'},
        'paint': {
            'circle-color': 'rgb(23, 14, 3)',
            'circle-radius': {
                'base': 1.1,
                'stops': [
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
        'id': 'eonet-point',
        'type': 'symbol',
        'source': 'eonet',
        'layout': {
            'visibility' : 'none',
            'icon-allow-overlap': true,
            'icon-image': '{icon}-15'
        }
    });

    // Volcanoes
    map.addSource('volcanoes', {
        'type': 'geojson',
        'data': geojson
    });

    map.addLayer({
        'id': 'volcanoes',
        'type': 'symbol',
        'source': 'volcanoes',
        'layout': {
            'visibility' : 'none',
            'icon-allow-overlap': true,
            'icon-image': 'volcano-red-15',
            'icon-size': {
                'base': 1,
                'stops': [
                    [0, 0.7],
                    [9, 1]
                ]
            }

        }
    });

    map.on('mousemove', function (e) {
        var mouseRadius = 1,
            feature = map.queryRenderedFeatures([
                [e.point.x - mouseRadius, e.point.y - mouseRadius],
                [e.point.x + mouseRadius, e.point.y + mouseRadius]
            ], {layers: ['eonet-point', 'earthquakes-point', 'disasterdb-points', 'disasterdb-polygons', 'disasterdb-lines', 'volcanoes']})[0];

        if (feature) {
            map.getCanvas().style.cursor = 'pointer';

        } else {
            map.getCanvas().style.cursor = 'inherit';
        }

    });

    map.on('click', function (e) {
        const mouseRadius = 1;
        if (map.getLayer('earthquakes-point').getLayoutProperty('visibility') !== 'none') {
            let feature = map.queryRenderedFeatures([
                [e.point.x - mouseRadius, e.point.y - mouseRadius],
                [e.point.x + mouseRadius, e.point.y + mouseRadius]
            ], {layers: ['earthquakes-point']})[0];

            if (feature) {
                new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML('<div class="dtypeImage"><div class="icon icon-earthquake" title="earthquake"></div></div>' +
                                `<div class="linetab bold">Name: ${feature.properties.title}</div>` +
                                `<div class="linetab">Date: ${moment(feature.properties.time).utc().format('YYYY-MM-DD HH:mm:ss')} (UTC)</div>` +
                                `<div class="linetab">Magnitude: ${feature.properties.mag}</div>` +
                                `<div class="linetab">Felt: ${((feature.properties.felt === null) ? 'No' : 'Yes')}</div>` +
                                `<div class="linetab">Duration (min): ${feature.properties.dmin}</div>` +
                                `<div class="linetab">Tsunami: ${((feature.properties.tsunami === 0) ? 'No' : 'Yes')}</div>` +
                                `<div class="linetab"><a target="_blank" href="${feature.properties.url}">Info</a></div>` +
                                `<div class="linetab"><a class="link" onclick="seeEQimages(\'${feature.properties.detail}\')">Search Images/Add to Database</a></div>`)
                    .addTo(map);
            }
        }

        if (map.getLayer('eonet-point').getLayoutProperty('visibility') !== 'none') {
            let feature = map.queryRenderedFeatures([
                [e.point.x - mouseRadius, e.point.y - mouseRadius],
                [e.point.x + mouseRadius, e.point.y + mouseRadius]
            ], {layers: ['eonet-point']})[0];

            if (feature) {
                let links = '';
                const sources = JSON.parse(feature.properties.sources);

                for (let j = 0; j < sources.length; j++) {
                    links += `<a target="_blank" href="${sources[j].url}">${sources[j].id}</a> `;
                }

                new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(`<div class="linetab bold">Name: ${feature.properties.title}</div>` +
                                `<div class="linetab">Date: ${moment(feature.properties.date).format('YYYY-MM-DD HH:mm:ss')} (UTC)</div>` +
                                `<div class="linetab">Type: ${feature.properties.dtype}</div>` +
                                `<div class="linetab">Description: ${feature.properties.description}</div>` +
                                `<div class="linetab">Links:${links}</div>` +
                                `<div class="linetab"><a class="link" onclick="seeEONETimages(\'${feature.properties.id}\')">Search Images/Add to Database</a></div>`)
                    .addTo(map);
            }
        }

        if (map.getLayer('volcanoes').getLayoutProperty('visibility') !== 'none') {
            let feature = map.queryRenderedFeatures([
                [e.point.x - mouseRadius, e.point.y - mouseRadius],
                [e.point.x + mouseRadius, e.point.y + mouseRadius]
            ], {layers: ['volcanoes']})[0];

            if (feature) {
                new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(`<div class="linetab bold">Name: ${feature.properties.Name}</div>` +
                             feature.properties.Html +
                             `<div class="linetab"><a class="link" onclick="seeVolcimages(\'${feature.properties.Name}\')">Search Images/Add to Database</a></div>`)
                    .addTo(map);
            }
        }

        let feature = map.queryRenderedFeatures([
            [e.point.x - mouseRadius, e.point.y - mouseRadius],
            [e.point.x + mouseRadius, e.point.y + mouseRadius]
        ], {layers: ['disasterdb-points', 'disasterdb-polygons', 'disasterdb-lines']})[0];

        if (feature) {
            let dtype = '';
            let maindType;
            const disasterType = JSON.parse(feature.properties.dtype);
            const url = 'https://disasterwatch.remotepixel.ca/?event=' + feature.properties.uuid;

            for (var j = 0; j < disasterType.length; j++) {
                dtype += `<span type="dtype" class="${disasterType[j]}">${disasterType[j]}</span> `;
            }

            if (disasterType.length === 0) {
                dtype = '<span type="dtype" class="unclassified">unclassified</span>';
                maindType = 'unclassified';
            } else {
                maindType = disasterType[0];
            }

            const comments = feature.properties.comments.split('<br />').map(function(e){
                return textTolink(e);
            });

            let commentsBlock = '';
            for (let j = 0; j < comments.length; j++) {
                commentsBlock += comments[j];
            }

            new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(`<div class="dtypeImage"><div class="icon icon-${maindType} ${maindType}" title="${maindType}"></div></div>` +
                            `<div class="linetab bold">Name: ${feature.properties.name}</div>` +
                            `<div class="linetab uuid">uuid: ${feature.properties.uuid}</div>` +
                            `<div class="linetab disasterType">Type: ${dtype}</div>` +
                            `<div class="linetab">Location: ${feature.properties.place}</div>` +
                            `<div class="linetab">Start Date: ${feature.properties.dateStart}</div>` +
                            `<div class="linetab">End Date: ${feature.properties.dateEnd}</div>` +
                            `<div class="linetab">Followers: ${feature.properties.nbfollowers}</div>` +
                            '<div class="linetab">Comments:</div>' +
                            `<div class="linetab comments">${commentsBlock}</div>` +
                            '<div class="delim"></div>' +
                            `<div class="linetab"><a onclick="seeEvtDBimages(\'${feature.properties.uuid}\')">Search Images</a></div>` +
                            '<div class="linetab">' +
                                `<a onclick="editEvt(\'${feature.properties.uuid}\')">Update</a> | ` +
                                `<a onclick="removeEvt(\'${feature.properties.uuid}\')">Remove</a> | ` +
                                '<a onclick="toggleSubscribe()">Subscribe</a>' +
                            '</div>' +
                            '<span class="db-error red">Error...Cannot remove this event from database</span>' +
                            `<div data-uuid="${feature.properties.uuid}" class="subscribe-section display-none">` +
                                '<div class="delim"></div>' +
                                '<div class="sat-filter">' +
                                    '<label><input data="landsat8" type="checkbox" checked> Landsat-8</label>' +
                                    '<label><input data="sentinel2" type="checkbox" checked> Sentinel-2</label>' +
                                    '<label><input data="sentinel1" type="checkbox" checked> Sentinel-1</label>' +
                                '</div>' +
                                '<input type="email" class="form-control" placeholder="Email">' +
                                '<div class="btn btn-default" onclick="subscribeEvt(this)">Subscribe</div>' +
                                '<span class="error red">Error...</span>' +
                            '</div>' +
                            '<div class="share-section">' +
                                `<a id="twitter" class="sharebutt" href="http://twitter.com/share?url=${url}&via=RemotePixel" title="Share on Twitter" target="_blank">` +
                                    '<i class="fa fa-twitter"></i>' +
                                '</a>' +
                                `<a id="linkedin" class="sharebutt" href="http://www.linkedin.com/shareArticle?mini=true&url=${url}&source=https://remotepixel.ca" title="Share on LinkedIn" target="_blank">` +
                                    '<i class="fa fa-linkedin"></i>' +
                                '</a>' +
                                `<a id="facebook" class="sharebutt" href="https://www.facebook.com/sharer/sharer.php?u=${url}" title="Share on Facebook" target="_blank">` +
                                    '<i class="fa fa-facebook"></i>' +
                                '</a>' +
                            '</div>'
                        )
                .addTo(map);
        }
    });

    const slider = document.getElementById('slider');
    const sliderValue = document.getElementById('slider-value');

    slider.addEventListener('input', function (e) {
        if (map.getSource('gibs-tiles')) {
            map.setPaintProperty('gibs-tiles', 'raster-opacity', parseInt(e.target.value, 10) / 100);
        }
        sliderValue.textContent = e.target.value + '%';
    });

    getDisasterdb(function(err, res){
        if (err) {
            $('#modalDBerror').modal();
            return;
        }
        const keys = getUrlVars();
        if (keys.hasOwnProperty('update')) {
            editEvt(keys.update);
            $('.dwhelp-block').removeClass('on');
        } else if (keys.hasOwnProperty('images')) {
            seeEvtDBimages(keys.images);
            $('.dwhelp-block').removeClass('on');
        } else if (keys.hasOwnProperty('event')){
            mapFlyToDisaster(keys.event);
            $('.dwhelp-block').removeClass('on');
        }
        $('.main-spin').addClass('display-none');
    });
    getEarthquake();
    getEONETEvents();
    getVolcanoes();
});

////////////////////////////////////////////////////////////////////////////////
map.on('draw.selectionchange', function (e) {
    if (!$('.leftblock').hasClass('in')) {
        if (e.features.length !== 0) $('#modalQuestion').modal();
    }
});

// map.on('draw.update', function () {
//
//     getImages();
// });
//
// // HACK
// // if user unselect the draw
// // this is not user friendly
// // but mapbox-gl is listening only on map clicks
// $(document).on('click', '.disaster-info', function() {
//     $('#map').click();
// });


map.on('draw.update', function (e) {

    // Check if the geometry is in the database - HACK: check if feature as properties uuid!
    if (e.features[0].geometry.type === 'Polygon') {
        if (turf.area(e.features[0]) >= 1e11) {
            $('#modalPolySize').modal();
            return;
        }
    }

    if (!e.features[0].properties.hasOwnProperty('uuid')) {
        getImages();
        // re-do geocoding ?
        if (e.features[0].geometry.type === 'Polygon') {
            const centroid = turf.centroid(e.features[0]);
            getPlace(centroid.geometry.coordinates);
        }
        if (e.features[0].geometry.type === 'Point') {
            getPlace(e.features[0].geometry.coordinates);
        }
    }
});

map.on('draw.create', function (e) {

    if (e.features[0].geometry.type === 'Polygon') {
        if (turf.area(e.features[0]) >= 1e11) {
            $('#modalPolySize').modal();
            draw.deleteAll();
            return;
        }
    }

    // limit draw Polygons size ??
    openleftBlock();
    getImages();

    if (e.features[0].geometry.type === 'Polygon') {
        let bbox = turf.bbox(e.features[0].geometry);
        const centroid = turf.centroid(e.features[0]);
        getPlace(centroid.geometry.coordinates);
        map.fitBounds(bbox, {padding: 20});
    }

    if (e.features[0].geometry.type === 'Point') {
        let round = turf.buffer(e.features[0], 100, 'kilometers');
        let bbox = turf.bbox(round);
        getPlace(e.features[0].geometry.coordinates);
        map.fitBounds(bbox, {padding: 20});
    }
});

geocoder.on('result', function(ev) {
    $('.geocoder-container').toggleClass('in');

    const feature = {
        geometry: ev.result.geometry,
        properties: {},
        type: 'Feature'
    };
    draw.add(feature);

    // edit place information
    document.getElementById('disasterPlace').value = ev.result.place_name;

    openleftBlock();
    getImages();
});

////////////////////////////////////////////////////////////////////////////////

function getPlace(coordinates) {
    const mapboxAPIurl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0].toString()},${coordinates[1].toString()}.json?types=place&access_token=${mapboxgl.accessToken}`;
    $.getJSON(mapboxAPIurl).success(function(data){
        document.getElementById('disasterPlace').value = data.features[0].place_name;
    });
}


function setStyle(basename) {
    if (map.getSource('gibs-tiles')) {
        map.removeLayer('gibs-tiles');
        map.removeSource('gibs-tiles');
    }

    switch (basename) {
    case 'MapboxMap':
        $('.date-button').attr('disabled', 'disabled');
        $('#slider').attr('disabled', 'disabled');
        $('.bottom-right-control').addClass('display-none');
        $('.bottom-right-control').removeClass('on');
        return;
    default:
        if ($('.bottom-right-control').hasClass('display-none')) {
            $('.bottom-right-control').removeClass('display-none');
            $('.bottom-right-control').addClass('on');
        }
        $('.date-button').attr('disabled', false);
        $('#slider').attr('disabled', false);

        const dateValue = document.getElementsByClassName('date-button')[0].textContent;
        const basemaps_url = `https://map1.vis.earthdata.nasa.gov/wmts-webmerc/${basename}/default/${dateValue}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;

        map.addSource('gibs-tiles', {
            'type': 'raster',
            'tiles': [
                basemaps_url
            ],
            'attribution' : [
                '<a href="https://earthdata.nasa.gov/about/science-system-description/eosdis-components/global-imagery-browse-services-gibs"> NASA EOSDIS GIBS</a>'
            ],
            'tileSize': 256
        });

        map.addLayer({
            'id': 'gibs-tiles',
            'type': 'raster',
            'source': 'gibs-tiles',
            'minzoom': 1,
            'maxzoom': 9,
            'paint': {'raster-opacity': document.getElementById('slider').value / 100}
        }, 'admin-2-boundaries-bg');
    }
}

function changeOverlay(overlay) {

    $('#basemaps-panel .side-view-content .side-element .link-on').each(function () {
        $(this).removeClass('on');
    });

    $('#' + overlay + ' .link-on').addClass('on');
    setStyle(overlay);
}

function update_basemaps() {
    const overlay = document.getElementsByClassName('link-on on')[0].parentElement.getAttribute('id');
    setStyle(overlay);
}

function drawOnMap(type) {
    draw.deleteAll();

    if (draw.getMode() !== 'simple_select') draw.changeMode('simple_select');

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

function mapFlyToDisaster(id) {

    closePopup();

    const feature = map.getSource('disasterdb')._data.features.filter(function(e){
        return (e.properties.uuid === id);
    })[0];

    if (feature){
        let lngLat;
        if (feature.geometry.type === 'Polygon') {
            let bbox = turf.bbox(feature.geometry);
            lngLat = mapboxgl.LngLat.convert(turf.centroid(feature).geometry.coordinates);
            map.fitBounds(bbox, {padding: 20});
        } else {
            let round = turf.buffer(feature, 100, 'kilometers');
            let bbox = turf.bbox(round);
            lngLat = mapboxgl.LngLat.convert(feature.geometry.coordinates.slice(0,2));
            map.fitBounds(bbox, {padding: 20});
        }
        // if (feature.geometry.type === 'Point') {
        //
        // }

        let dtype = '';
        let disasterType = feature.properties.dtype;
        let url = `https://disasterwatch.remotepixel.ca/?event=${feature.properties.uuid}`;

        if (disasterType.length === 0) disasterType = ['unclassified'];

        for (let j = 0; j < disasterType.length; j++) {
            dtype += `<span type="dtype" class="${disasterType[j]}">${disasterType[j]}</span> `;
        }

        const comments = feature.properties.comments.split('<br />').map(function(e){
            return textTolink(e);
        });

        let commentsBlock = '';
        for (let j = 0; j < comments.length; j++) {
            commentsBlock += comments[j];
        }

        new mapboxgl.Popup()
            .setLngLat(lngLat)
            .setHTML(`<div class="dtypeImage"><div class="icon icon-${feature.properties.icon}" title="${feature.properties.icon}"></div></div>` +
                        `<div class="linetab bold">Name: ${feature.properties.name}"</div>` +
                        `<div class="linetab uuid">uuid: ${feature.properties.uuid}"</div>` +
                        `<div class="linetab disasterType">Type: ${dtype}"</div>` +
                        `<div class="linetab">Location: ${feature.properties.place}</div>` +
                        `<div class="linetab">Start Date: ${feature.properties.dateStart}</div>` +
                        `<div class="linetab">End Date: ${feature.properties.dateEnd}</div>` +
                        `<div class="linetab">Followers: ${feature.properties.nbfollowers}</div>` +
                        '<div class="linetab">Comments:</div>' +
                        `<div class="linetab comments">${commentsBlock}</div>` +
                        '<div class="delim"></div>' +
                        `<div class="linetab"><a onclick="seeEvtDBimages(\'${feature.properties.uuid}\')">Search Images</a></div>` +
                        '<div class="linetab">' +
                            `<a onclick="editEvt(\'${feature.properties.uuid}\')">Update</a> | ` +
                            `<a onclick="removeEvt(\'${feature.properties.uuid}\')">Remove</a> | ` +
                            '<a onclick="toggleSubscribe()">Subscribe</a>' +
                        '</div>' +
                        '<span class="db-error red">Error...Cannot remove this event from database</span>' +
                        `<div data-uuid="${feature.properties.uuid}" class="subscribe-section display-none">` +
                            '<div class="delim"></div>' +
                            '<div class="sat-filter">' +
                                '<label><input data="landsat8" type="checkbox" checked> Landsat-8</label>' +
                                '<label><input data="sentinel2" type="checkbox" checked> Sentinel-2</label>' +
                                '<label><input data="sentinel1" type="checkbox" checked> Sentinel-1</label>' +
                            '</div>' +
                            '<input type="email" class="form-control" placeholder="Email">' +
                            '<div class="btn btn-default" onclick="subscribeEvt(this)">Subscribe</div>' +
                            '<span class="error red">Error...</span>' +
                        '</div>' +
                        '<div class="share-section">' +
                            `<a id="twitter" class="sharebutt" href="http://twitter.com/share?url=${url}&via=RemotePixel" title="Share on Twitter" target="_blank">` +
                                '<i class="fa fa-twitter"></i>' +
                            '</a>' +
                            `<a id="linkedin" class="sharebutt" href="http://www.linkedin.com/shareArticle?mini=true&url=${url}&source=https://remotepixel.ca" title="Share on LinkedIn" target="_blank">` +
                                '<i class="fa fa-linkedin"></i>' +
                            '</a>' +
                            `<a id="facebook" class="sharebutt" href="https://www.facebook.com/sharer/sharer.php?u=${url}" title="Share on Facebook" target="_blank">` +
                                '<i class="fa fa-facebook"></i>' +
                            '</a>' +
                        '</div>'
                    )
            .addTo(map);
    }
}

function hoverS1(id) {
    map.setFilter('s1-highlighted', ['in', 'id', id]);
}

function hoverS2(grid) {
    map.setFilter('s2-highlighted', ['in', 'Name', grid]);
}

function hoverL8(path, row) {
    map.setFilter('l8-highlighted', ['all', ['==', 'PATH', path], ['==', 'ROW', row]]);
}

$('#volcanoes-checkbox').change(function () {
    $('#volcanoes-checkbox').parent().toggleClass('green');
    if (document.getElementById('volcanoes-checkbox').checked) {
        map.setLayoutProperty('volcanoes', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('volcanoes', 'visibility', 'none');
    }
});

$('#earthquake-checkbox').change(function () {
    $('#earthquake-checkbox').parent().toggleClass('green');
    if (document.getElementById('earthquake-checkbox').checked) {
        map.setLayoutProperty('earthquakes-point', 'visibility', 'visible');
        map.setLayoutProperty('earthquakes-blur', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('earthquakes-point', 'visibility', 'none');
        map.setLayoutProperty('earthquakes-blur', 'visibility', 'none');
    }
});

$('#eonet-checkbox').change(function () {
    $('#eonet-checkbox').parent().toggleClass('green');
    if (document.getElementById('eonet-checkbox').checked) {
        map.setLayoutProperty('eonet-point', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('eonet-point', 'visibility', 'none');
    }
});
