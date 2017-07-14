'use strict';

function feeddownloadS2(elem, preview) {
    const s2prefix = 'https://sentinel-s2-l1c.s3.amazonaws.com/';
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
            '<a id="b11" target="_blank" href="' + s2prefix + elem + '/B11.jp2" download>B11 - Shortwave Infrared 1 (20m)</a>' +
            '<a id="b12" target="_blank" href="' + s2prefix + elem + '/B12.jp2" download>B12 - Shortwave Infrared 2 (20m)</a>' +
            '<a id="mtl" target="_blank" href="' + s2prefix + elem + '/productInfo.json" download>Metadata</a>'
    );
    $('#modalDownloadS2 .overview').html('<img src="' + preview + '">');
    $('#modalDownloadS2').modal();
}

function feeddownloadL8(url, id) {
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

    $.get(`${rpix_api_us}/l8_overview`, params )
        .done(function (data) {
            $('#modalDownloadL8 .overview').html('<img src="data:image/png;base64,' + data + '">');
        })
        .fail(function () {
            $('#modalDownloadL8 .overview').html('<span>Preview Unavailable</span>');
        });

    $('#modalDownloadL8').modal();
}

$('#modalDownloadL8').on('shown.bs.modal', function () {
    $('#modalDownloadL8 .btn-download').removeClass('processing');
    $('#modalDownloadL8 .btn-download').removeClass('error');
    $('#modalDownloadL8 .btn-download').removeClass('ready');
    $('#modalDownloadL8 .btn-download span').text('Download');
    $('#modalDownloadL8 .btn-download a').attr('href', '');
    $('#modalDownloadL8 .dropdown-menu li a').each(function () {
        $(this).removeClass('on');
    });

    $('#modalDownloadL8 .dropdown-menu li a').first().addClass('on');
    $('#modalDownloadL8 .dropdown .btn:first-child').html($('#modalDownloadL8 .dropdown-menu li a').first().text() + ' <span class="caret"></span>');
});

$('#modalDownloadL8').on('hidden.bs.modal', function () {
    $('#modalDownloadL8 .dwn-bands').empty();
    $('#modalDownloadL8 .overview').attr('data-id', '');
    $('#modalDownloadL8 .overview').html('<span><i class="fa fa-spinner fa-spin"></i></span>');
});

$('#modalDownloadS2').on('shown.bs.modal', function () {
    $('#modalDownloadS2 .dropdown-menu li a').each(function () {
        $(this).removeClass('on');
    });
    $('#modalDownloadS2 .dropdown-menu li a').first().addClass('on');
    $('#modalDownloadS2 .dropdown .btn:first-child').html($('#modalDownloadS2 .dropdown-menu li a').first().text() + ' <span class="caret"></span>');
});

$('#modalDownloadS2').on('hidden.bs.modal', function () {
    $('#modalDownloadS2 .dwn-bands').empty();
    $('#modalDownloadS2 .overview').attr('data-id', '');
    $('#modalDownloadS2 .overview').html('<span><i class="fa fa-spinner fa-spin"></i></span>');
});


$('#modalDownloadS2 .dropdown-menu li a').click(function () {
    $('#modalDownloadS2 .overview').html('<span><i class="fa fa-spinner fa-spin"></i></span>');
    $('#modalDownloadS2 .dropdown .btn:first-child').html($(this).text() + ' <span class="caret"></span>');

    const params = {
        path: $('#modalDownloadS2 .overview').attr('data-id'),
        bands: $(this).parent().attr('data-bands')
    };

    if (params.bands === ['04','03','02']) {
        $('#modalDownloadS2 .overview').html('<img src="' + $('#modalDownloadS2 .overview').attr('data-prev') + '">');
    } else {
        $.get(`${rpix_api_eu}/s2_overview`, params)
            .done(function (data) {
                $('#modalDownloadS2 .overview').html('<img src="data:image/png;base64,' + data + '">');
            })
            .fail(function () {
                $('#modalDownloadS2 .overview').html('<span>Preview Unavailable</span>');
            });
    }

    $('#modalDownloadS2 .dropdown-menu li a').each(function () {
        $(this).removeClass('on');
    });
    $(this).addClass('on');
});

$('#modalDownloadL8 .dropdown-menu li a').click(function () {
    $('#modalDownloadL8 .btn-download').removeClass('processing');
    $('#modalDownloadL8 .btn-download').removeClass('error');
    $('#modalDownloadL8 .btn-download').removeClass('ready');
    $('#modalDownloadL8 .btn-download span').text('Download');
    $('#modalDownloadL8 .btn-download a').attr('href', '');
    $('#modalDownloadL8 .overview').html('<span><i class="fa fa-spinner fa-spin"></i></span>');
    $('#modalDownloadL8 .dropdown .btn:first-child').html($(this).text() + ' <span class="caret"></span>');

    const params = {
        scene: $('#modalDownloadL8 .overview').attr('data-id'),
        bands: $(this).parent().attr('data-bands')
    };

    $.get(`${rpix_api_us}/l8_overview`, params )
        .done(function (data) {
            $('#modalDownloadL8 .overview').html('<img src="data:image/png;base64,' + data + '">');
        })
        .fail(function () {
            $('#modalDownloadL8 .overview').html('<span>Preview Unavailable</span>');
        });

    $('#modalDownloadL8 .dropdown-menu li a').each(function () {
        $(this).removeClass('on');
    });
    $(this).addClass('on');
});

function landsatdownload() {
    $('#modalDownloadL8 button.btn-download').addClass('processing');

    const params = {
        scene: $('#modalDownloadL8 .overview').attr('data-id'),
        bands: $('#modalDownloadL8 .dropdown-menu li .on').parent().attr('data-bands')
    };

    $.getJSON(`${rpix_api_us}/l8_full`, params, function (data) {
        $('#modalDownloadL8 button.btn-download').removeClass('processing');
        $('#modalDownloadL8 button.btn-download').addClass('ready');
        $('#modalDownloadL8 a.btn-download').attr('href', data.path);
    })
        .fail(function () {
            $('#modalDownloadL8 button.btn-download').removeClass('processing');
            $('#modalDownloadL8 button.btn-download').addClass('error');
            $('#modalDownloadL8 button.btn-download span').text('Error');
        });

}
