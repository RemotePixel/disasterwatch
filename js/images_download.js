let scope = {};

const feeddownloadS2 = (elem) => {

    const key = s2_name_to_key(elem);
    const aws_s2_url = 'http://sentinel-s2-l1c.s3.amazonaws.com/tiles/' + key;

    $('#modalDownloadS2 .overview').attr('data-id', elem);
    $('#modalDownloadS2 .overview').attr('data-prev', aws_s2_url + '/preview.jpg');

    $('#modalDownloadS2 .dwn-bands').append(
        '<span>Direct Download S2 band (Right Click on link)</span>' +
            '<a id="b1" target="_blank" href="' + aws_s2_url + '/B01.jp2" download>B1 - Coastal (60m)</a>' +
            '<a id="b2" target="_blank" href="' + aws_s2_url + '/B02.jp2" download>B2 - Blue (10m)</a>' +
            '<a id="b3" target="_blank" href="' + aws_s2_url + '/B03.jp2" download>B3 - Green (10m)</a>' +
            '<a id="b4" target="_blank" href="' + aws_s2_url + '/B04.jp2" download>B4 - Red (10m)</a>' +
            '<a id="b5" target="_blank" href="' + aws_s2_url + '/B05.jp2" download>B5 - Vegetation Classif 1 (20m)</a>' +
            '<a id="b6" target="_blank" href="' + aws_s2_url + '/B06.jp2" download>B6 - Vegetation Classif 2 (20m)</a>' +
            '<a id="b7" target="_blank" href="' + aws_s2_url + '/B07.jp2" download>B7 - Vegetation Classif 3 (20m)</a>' +
            '<a id="b8" target="_blank" href="' + aws_s2_url + '/B08.jp2" download>B8 - Near Infrared (10m)</a>' +
            '<a id="b8" target="_blank" href="' + aws_s2_url + '/B8A.jp2" download>B8A - Narrow Near Infrared (20m)</a>' +
            '<a id="b9" target="_blank" href="' + aws_s2_url + '/B09.jp2" download>B9 - Water vapour (60m)</a>' +
            '<a id="b10" target="_blank" href="' + aws_s2_url + '/B10.jp2" download>B10 - Cirrus (60m)</a>' +
            '<a id="b11" target="_blank" href="' + aws_s2_url + '/B11.jp2" download>B11 - Shortwave Infrared 1 (20m)</a>' +
            '<a id="b12" target="_blank" href="' + aws_s2_url + '/B12.jp2" download>B12 - Shortwave Infrared 2 (20m)</a>' +
            '<a id="mtl" target="_blank" href="' + aws_s2_url + '/productInfo.json" download>Metadata</a>'
    );

    $('#modalDownloadS2 .overview').html('<img src="' + aws_s2_url + '/preview.jpg' + '">');
    $('#modalDownloadS2').modal();
};

const feeddownloadL8 = (url, id) => {
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

    const params = {
        scene: id,
        bands: '[4,3,2]'
    };

    $.get(`${rpix_api_us}/l8_overview`, params, (data) => {
        $('#modalDownloadL8 .overview').html('<img src="data:image/png;base64,' + data + '">');
    })
        .fail(() => {
            $('#modalDownloadL8 .overview').html('<span>Preview Unavailable</span>');
        });

    $('#modalDownloadL8').modal();
};

const landsatdownload = () => {
    $('#modalDownloadL8 button.btn-download').addClass('processing');

    const params = { scene: $('#modalDownloadL8 .overview').attr('data-id') };
    let bands = $('#modalDownloadL8 .dropdown-menu li .on').parent().attr('data-bands');
    if (bands === 'ndvi') {
        params.ndvi = true;
    } else {
        params.bands = bands;
    }

    $.getJSON(`${rpix_api_us}/l8_full`, params, (data) => {
        $('#modalDownloadL8 button.btn-download').removeClass('processing');
        $('#modalDownloadL8 button.btn-download').addClass('ready');
        $('#modalDownloadL8 a.btn-download').attr('href', data.path);
    })
        .fail(() => {
            $('#modalDownloadL8 button.btn-download').removeClass('processing');
            $('#modalDownloadL8 button.btn-download').addClass('error');
            $('#modalDownloadL8 button.btn-download span').text('Error');
        });

};

$('#modalDownloadL8').on('shown.bs.modal', () => {
    $('#modalDownloadL8 .btn-download').removeClass('processing');
    $('#modalDownloadL8 .btn-download').removeClass('error');
    $('#modalDownloadL8 .btn-download').removeClass('ready');
    $('#modalDownloadL8 .btn-download span').text('Download');
    $('#modalDownloadL8 .btn-download a').attr('href', '');
    $('#modalDownloadL8 .dropdown-menu li a').each(function() {
        $(this).removeClass('on');
    });

    $('#modalDownloadL8 .dropdown-menu li a').first().addClass('on');
    $('#modalDownloadL8 .dropdown .btn:first-child').html($('#modalDownloadL8 .dropdown-menu li a').first().text() + ' <span class="caret"></span>');
});

$('#modalDownloadL8').on('hidden.bs.modal', () => {
    $('#modalDownloadL8 .dwn-bands').empty();
    $('#modalDownloadL8 .overview').attr('data-id', '');
    $('#modalDownloadL8 .overview').html('<span><i class="fa fa-spinner fa-spin"></i></span>');
});

$('#modalDownloadS2').on('shown.bs.modal', () => {
    $('#modalDownloadS2 .dropdown-menu li a').each(function() {
        $(this).removeClass('on');
    });
    $('#modalDownloadS2 .dropdown-menu li a').first().addClass('on');
    $('#modalDownloadS2 .dropdown .btn:first-child').html($('#modalDownloadS2 .dropdown-menu li a').first().text() + ' <span class="caret"></span>');
});

$('#modalDownloadS2').on('hidden.bs.modal', () => {
    $('#modalDownloadS2 .dwn-bands').empty();
    $('#modalDownloadS2 .overview').attr('data-id', '');
    $('#modalDownloadS2 .overview').html('<span><i class="fa fa-spinner fa-spin"></i></span>');
});

$('#modalDownloadS2 .dropdown-menu li a').click(function() {
    $('#modalDownloadS2 .overview').html('<span><i class="fa fa-spinner fa-spin"></i></span>');
    $('#modalDownloadS2 .dropdown .btn:first-child').html($(this).text() + ' <span class="caret"></span>');

    const params = {scene: $('#modalDownloadS2 .overview').attr('data-id')};
    let bands = this.parentNode.getAttribute('data-bands');
    if (bands === 'ndvi') {
        params.ndvi = true;
    } else {
        params.bands = bands;
    }

    if (params.bands === ['04','03','02']) {
        $('#modalDownloadS2 .overview').html('<img src="' + $('#modalDownloadS2 .overview').attr('data-prev') + '">');
    } else {
        $.get(`${rpix_api_eu}/s2_overview`, params, (data) => {
            $('#modalDownloadS2 .overview').html('<img src="data:image/png;base64,' + data + '">');
        })
            .fail(() => {
                $('#modalDownloadS2 .overview').html('<span>Preview Unavailable</span>');
            });
    }

    $('#modalDownloadS2 .dropdown-menu li a').each(function() {
        $(this).removeClass('on');
    });
    $(this).addClass('on');
});

$('#modalDownloadL8 .dropdown-menu li a').click(function() {
    $('#modalDownloadL8 .btn-download').removeClass('processing');
    $('#modalDownloadL8 .btn-download').removeClass('error');
    $('#modalDownloadL8 .btn-download').removeClass('ready');
    $('#modalDownloadL8 .btn-download span').text('Download');
    $('#modalDownloadL8 .btn-download a').attr('href', '');
    $('#modalDownloadL8 .overview').html('<span><i class="fa fa-spinner fa-spin"></i></span>');
    $('#modalDownloadL8 .dropdown .btn:first-child').html($(this).text() + ' <span class="caret"></span>');

    const params = { scene: $('#modalDownloadL8 .overview').attr('data-id') };
    let bands = this.parentNode.getAttribute('data-bands');
    if (bands === 'ndvi') {
        params.ndvi = true;
    } else {
        params.bands = bands;
    }

    $.get(`${rpix_api_us}/l8_overview`, params, (data) => {
        $('#modalDownloadL8 .overview').html('<img src="data:image/png;base64,' + data + '">');
    })
        .fail(() => {
            $('#modalDownloadL8 .overview').html('<span>Preview Unavailable</span>');
        });

    $('#modalDownloadL8 .dropdown-menu li a').each(function() {
        $(this).removeClass('on');
    });
    $(this).addClass('on');
});


const initSceneL8 = (sceneID) => {
    $('.map .spin').removeClass('display-none');
    // $('.errorMessage').addClass('none');

    let min = $('.bottom-right-control-tiles #minCount').val();
    let max = $('.bottom-right-control-tiles #maxCount').val();
    const query = `${landsat_tiler_url}/metadata/${sceneID}?'pmim=${min}&pmax=${max}&access_token=${ENDPOINT_TOKEN}`;

    $.getJSON(query, (data) => {
        scope = data;
        scope.satellite = 'landsat';
        updateRasterTile('landsat');
        $('.bottom-right-control-tiles #sceneid').text(sceneID);
        $('.bottom-right-control-tiles #sentinel-option').addClass('display-none');
        $('.bottom-right-control-tiles #landsat-option').removeClass('display-none');
        $('.bottom-right-control-tiles').removeClass('display-none');
        // $('.errorMessage').addClass('none');
    })
        .fail(() => {
            if (map.getSource('raster-tiles')) map.removeSource('raster-tiles');
            if (map.getLayer('raster-tiles')) map.removeLayer('raster-tiles');
            $('.bottom-right-control-tiles #sceneid').text('');
            // $('.errorMessage').removeClass('none');
        })
        .always(() => {
            $('.map .spin').addClass('display-none');
        });
};

const initSceneS2 = (sceneID) => {
    $('.map .spin').removeClass('display-none');
    // $('.errorMessage').addClass('none');

    let min = $('.bottom-right-control-tiles #minCount').val();
    let max = $('.bottom-right-control-tiles #maxCount').val();
    const query = `${sentinel_tiler_url}/s2/metadata/${sceneID}?'pmim=${min}&pmax=${max}&access_token=${ENDPOINT_TOKEN}`;

    $.getJSON(query, (data) => {
        scope = data;
        scope.satellite = 'sentinel';
        updateRasterTile('sentinel');
        $('.bottom-right-control-tiles #sceneid').text(sceneID);
        $('.bottom-right-control-tiles #landsat-option').addClass('display-none');
        $('.bottom-right-control-tiles #sentinel-option').removeClass('display-none');
        $('.bottom-right-control-tiles').removeClass('display-none');
        // $('.errorMessage').addClass('none');
    })
        .fail(() => {
            if (map.getSource('raster-tiles')) map.removeSource('raster-tiles');
            if (map.getLayer('raster-tiles')) map.removeLayer('raster-tiles');
            $('.bottom-right-control-tiles #sceneid').text('');
            // $('.errorMessage').removeClass('none');
        })
        .always(() => {
            $('.map .spin').addClass('display-none');
        });
};

const updateRasterTile = () => {
    if (map.getLayer('raster-tiles')) map.removeLayer('raster-tiles');
    if (map.getSource('raster-tiles')) map.removeSource('raster-tiles');

    let tileURL;
    let attrib;
    let maxzoom;
    let rgb;
    let bands;

    if (scope.satellite === 'sentinel') {
        rgb = $('.map .bottom-right-control-tiles #sentinel-option #rgb-select').attr('value');
        bands = rgb.split(',');
        tileURL = `${sentinel_tiler_url}/s2/tiles/${scope.sceneid}/{z}/{x}/{y}.png?` +
            `rgb=${rgb}` +
            '&tile=256' +
            `&r_bds=${scope.rgbMinMax[bands[0]]}` +
            `&g_bds=${scope.rgbMinMax[bands[1]]}` +
            `&b_bds=${scope.rgbMinMax[bands[2]]}` +
            `&access_token=${ENDPOINT_TOKEN}`;

        attrib = '<span> &copy; Copernicus / ESA 2017</span>';
        maxzoom = 15;
    } else {
        rgb = $('.map .bottom-right-control-tiles #landsat-option #rgb-select').attr('value');
        bands = rgb.split(',');
        tileURL = `${landsat_tiler_url}/tiles/${scope.sceneid}/{z}/{x}/{y}.png?` +
            `rgb=${bands}` +
            '&tile=256' +
            `&r_bds=${scope.rgbMinMax[bands[0]]}` +
            `&g_bds=${scope.rgbMinMax[bands[1]]}` +
            `&b_bds=${scope.rgbMinMax[bands[2]]}` +
            `&access_token=${ENDPOINT_TOKEN}`;
        if (rgb == '4,3,2') tileURL += '&pan=True';

        attrib = '<a href="https://landsat.usgs.gov/landsat-8"> &copy; USGS/NASA Landsat</a>';
        maxzoom = 14;
    }

    map.addSource('raster-tiles', {
        type: "raster",
        tiles: [tileURL],
        attribution : [attrib],
        bounds: scope.bounds,
        minzoom: 7,
        maxzoom: maxzoom,
        tileSize: 256
    });

    map.addLayer({
        'id': 'raster-tiles',
        'type': 'raster',
        'source': 'raster-tiles'
    }, 'disasterdb-points');

    const extent = scope.bounds;
    const llb = mapboxgl.LngLatBounds.convert([[extent[0],extent[1]], [extent[2],extent[3]]]);
    if (map.getZoom() <= 8) map.fitBounds(llb, {padding: 50});
};

const updateMetadata = () => {
    if (!map.getSource('raster-tiles')) return;

    if (scope.satellite == 'sentinel') {
        initSceneS2(scope.sceneid);
    } else {
        initSceneL8(scope.sceneid);
    }
};

$('#landsat-option .dropdown-menu li a').click(function() {
    $('.map .bottom-right-control-tiles #landsat-option #rgb-select').text($(this).text());
    $('.map .bottom-right-control-tiles #landsat-option #rgb-select').attr('value', this.parentNode.getAttribute('value'));

    $('#landsat-option .dropdown-menu li a').each(function() {
        $(this).removeClass('on');
    });
    $(this).addClass('on');
    updateRasterTile();
});

$('#sentinel-option .dropdown-menu li a').click(function() {
    $('.map .bottom-right-control-tiles #sentinel-option #rgb-select').text($(this).text());
    $('.map .bottom-right-control-tiles #sentinel-option #rgb-select').attr('value', this.parentNode.getAttribute('value'));

    $('#sentinel-option .dropdown-menu li a').each(function() {
        $(this).removeClass('on');
    });
    $(this).addClass('on');
    updateRasterTile();
});

document.getElementById('updateHisto').onclick = () => updateMetadata();
document.getElementById('clearTiles').onclick = () => {
    if (map.getLayer('raster-tiles')) map.removeLayer('raster-tiles');
    if (map.getSource('raster-tiles')) map.removeSource('raster-tiles');
    $('.bottom-right-control-tiles').addClass('display-none');
    $('.bottom-right-control-tiles').removeClass('off');

    $('.bottom-right-control-tiles #minCount').val(5);
    $('.bottom-right-control-tiles #maxCount').val(95);
};
