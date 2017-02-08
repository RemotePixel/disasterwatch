/*jslint browser: true*/
/*global $, jQuery, alert*/
/*global mapboxgl, mapboxgl, alert*/
/*global moment, moment, alert*/
/*global console, console, alert*/


var disasterwatchAPI = 'https://jriian4se3.execute-api.us-east-1.amazonaws.com/production/database/';

function getDisasterdb(callback) {
    "use strict";

    $('#disasters-panel .spin2').removeClass('display-none');
    $('.list-disasters').scrollTop(0);
    $('.list-disasters').empty();

    $.get(disasterwatchAPI + "toGEOJSON")
        .fail(function() {
            return callback('Could not retrieve the database')
        })
        .success(function(data){
            map.getSource('disasterdb').setData(data);
            for(var i = 0; i < data.features.length; i++) {
                $('.list-disasters').append(
                    '<div class="list-element" dw-type="' + data.features[i].properties.icon + '" date-start="' +  data.features[i].properties.dateStart + '" date-end="' + data.features[i].properties.dateEnd + '" target="_blank" onclick="mapFlyToDisaster(\'' + data.features[i].properties.uuid + '\')">'+
                        '<div class="col">' +
                            '<div class="disaster-descr"><div class="icon icon-' + data.features[i].properties.icon + '" title="' + data.features[i].properties.icon + '"></div></div>' +
                            '<div class="disaster-descr">'+
                                '<span class="dtitle">'+ data.features[i].properties.name +'</span>' +
                                '<span class="dplace">' + data.features[i].properties.place + '</span>' +
                            '</div>' +
                        '</div>' +
                    '</div>');
            }
            filterListDisaster();

            $('#disasters-panel .spin2').addClass('display-none');

            return callback(null, 'ready');
        });
}

function addDisastTodb() {
    "use strict";

    //Check for info validity
    //Error Handling

    var features = draw.getAll(),
        geojson = features.features[0];

    if (geojson.geometry.type === "Polygon") {
        if (turf.area(geojson) >= 1e11) {
            $("#modalPolySize").modal();
            return;
        }
    }

    $('.disaster-info button[type="submit"]').attr('disabled', true);
    $('.map .spin').removeClass('display-none');

    delete geojson['id'];

    geojson.properties.uuid = generateUUID();
    if (document.getElementById("mailCheckbox").checked) {
        var sat = $.map($(".disaster-info .sat-filter input:checked"), function (e) {
            return e.getAttribute('data');
        });
        geojson.properties.mail = {
            'mail': document.getElementById("disastermailTo").value,
            'satellite': sat
        };
    } else {
        geojson.properties.mail = null;
    }

    geojson.properties.dtype = $('#disasterType span[type="dtype"]').map(function () {
        return this.className
    }).toArray();

    geojson.properties.icon = (geojson.properties.dtype.length !== 0) ? geojson.properties.dtype[0] : 'unclassified';
    geojson.properties.name = document.getElementById("disasterName").value;
    geojson.properties.place = document.getElementById("disasterPlace").value;
    geojson.properties.dateStart = document.getElementById("disasterStartDate").value;
    geojson.properties.dateEnd = (document.getElementById("dateCheckbox").checked)? '' : document.getElementById("disasterEndDate").value;
    geojson.properties.comments  = document.getElementById("disasterComments").value.replace(/\n\r?/g, '<br />');

    geojson.properties.images = {
        'landsat8': ($('.img-preview [sat="landsat8"]').first().attr('img-date'))? $('.img-preview [sat="landsat8"]').first().attr('img-date') : moment.utc().subtract(15,'days').format('YYYY-MM-DD'),
        'sentinel2': ($('.img-preview [sat="sentinel2"]').first().attr('img-date'))? $('.img-preview [sat="sentinel2"]').first().attr('img-date') : moment.utc().subtract(15,'days').format('YYYY-MM-DD'),
        'sentinel1': ($('.img-preview [sat="sentinel1"]').first().attr('img-date'))? $('.img-preview [sat="sentinel1"]').first().attr('img-date') : moment.utc().subtract(15,'days').format('YYYY-MM-DD'),
    };

    $.ajax({
        url: disasterwatchAPI + "add",
        type: "POST",
        data: JSON.stringify(geojson),
        dataType: "json",
        contentType: "application/json",
    })
    .success(function(data){
        getDisasterdb(function(err, res){
            if (err) {
                $('#modalDBerror').modal();
                console.log('Could not retrieve updated database');
            }
            closeleftblock();
            $('.map .spin').addClass('display-none');
        });
    })
    .fail(function () {
        $('.disaster-info .error').addClass('on');
        $('.disaster-info button[type="submit"]').attr('disabled', false);
        $('.map .spin').addClass('display-none');
        console.log('Could not add Disaster Event to database');
    });
}

function updateDisastTodb() {
    "use strict";

    var features = draw.getAll(),
        geojson = features.features[0];

    if (geojson.geometry.type === "Polygon") {
        if (turf.area(geojson) >= 1e11) {
            $("#modalPolySize").modal();
            return;
        }
    }

    $('.disaster-info button[type="submit"]').attr('disabled', true);
    $('.map .spin').removeClass('display-none');

    delete geojson['id'];

    if (document.getElementById("mailCheckbox").checked) {
        var sat = $.map($(".disaster-info .sat-filter input:checked"), function (e) {
            return e.getAttribute('data');
        });
        geojson.properties.mail = {
            'mail': document.getElementById("disastermailTo").value,
            'satellite': sat
        };
    } else {
        geojson.properties.mail = null;
    }

    delete geojson.properties['nbfollowers'];

    geojson.properties.dtype = $('#disasterType span[type="dtype"]').map(function () {
        return this.className
    }).toArray();

    geojson.properties.icon = (geojson.properties.dtype.length !== 0) ? geojson.properties.dtype[0] : 'unclassified';
    geojson.properties.name = document.getElementById("disasterName").value;
    geojson.properties.place = document.getElementById("disasterPlace").value;
    geojson.properties.dateStart = document.getElementById("disasterStartDate").value;
    geojson.properties.dateEnd = (document.getElementById("dateCheckbox").checked)? '' : document.getElementById("disasterEndDate").value;
    geojson.properties.comments  = document.getElementById("disasterComments").value.replace(/\n\r?/g, '<br />');

    $.ajax({
        url: disasterwatchAPI + "update",
        type: "POST",
        data: JSON.stringify(geojson),
        dataType: "json",
        contentType: "application/json",
    })
    .success(function(data){
        getDisasterdb(function(err, res){
            if (err) {
                $('#modalDBerror').modal();
                console.log('Could not retrieve updated database');
            }
            closeleftblock();
            $('.map .spin').addClass('display-none');
        });
    })
    .fail(function () {
        $('.disaster-info .error').addClass('on');
        $('.disaster-info button[type="submit"]').attr('disabled', false);
        $('.map .spin').addClass('display-none');
        console.log('Could not update Disaster Event to database');
    });
}

function subscribeEvt(elem) {
    $('.map .spin').removeClass('display-none');

    var div = $(elem).parent(),
        uuid = div.attr("data-uuid");

    var sat = $.map($(div).find(".sat-filter input:checked"), function (e) {
        return e.getAttribute('data');
    });

    var mail = {
        'mail': $(div).find('input[type="email"]').val(),
        'satellite': sat
    },
        request = {
            "uuid": uuid,
            "mail" : mail
        }

    $.ajax({
        url: disasterwatchAPI + "subscribe",
        type: "POST",
        data: JSON.stringify(request),
        dataType: "json",
        contentType: "application/json",
    })
    .success(function(data){
        closePopup();
        getDisasterdb(function(err, res){
            if (err) {
                $('#modalDBerror').modal();
                console.log('Could not retrieve updated database');
            }
            $('.map .spin').addClass('display-none');
        });
    })
    .fail(function () {
        $('.map .spin').addClass('display-none');
        $('.mapboxgl-popup-content .subscribe-section .error').addClass('on');
        console.log('Could not update Disaster Event to database');
    });

}

function removeEvt(id) {
    "use strict";

    $('.map .spin').removeClass('display-none');
    $.ajax({
        url: disasterwatchAPI + "remove",
        type: "POST",
        data: JSON.stringify({"uuid": id}),
        dataType: "json",
        contentType: "application/json",
    })
    .success(function(data){
        getDisasterdb(function(err, res){
            if (err) {
                $('#modalDBerror').modal();
                console.log('Could not retrieve updated database');
            }
            closePopup();
            $('.map .spin').addClass('display-none');
        });
    })
    .fail(function () {
        $('.mapboxgl-popup-content .db-error').addClass('on');
        console.log('Could not remove Disaster Event to database');
    });
}

function seeEvtDBimages(id) {
    "use strict";

    var features = map.getSource("disasterdb")._data.features.filter(function(e){
        return (e.properties.uuid === id);
    });

    if (features.length === 0) {
        $("#modalError").modal();
    } else {

        draw.deleteAll();
        openleftBlock();

        $(".tab-selector-1").addClass('out');
        $(".tab-selector-2").addClass('out');

        if (draw.getMode() !== 'static'){
            draw.changeMode('static');
        }

        var featureId = draw.add(features[0]),
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

        getImages();
        closePopup();
    }
}

function editEvt(id) {

    var features = map.getSource("disasterdb")._data.features.filter(function(e){
        return (e.properties.uuid === id);
    });

    if (features.length === 0) {
        $("#modalError").modal();
    } else {
        resetForm();
        openleftBlock();

        draw.deleteAll();
        if (draw.getMode() !== 'simple_select'){
            draw.changeMode('simple_select');
        }
        $(".tab-selector-2").prop( "checked", true);
        $(".tab-selector-1").addClass('out');
        $(".tab-selector-2").addClass('out');

        var featureId = draw.add(features[0]);

        if (features[0].geometry.type === "LineString") {
            var bbox = turf.bbox(features[0].geometry);
            map.fitBounds(bbox, {padding: 20});
        }

        if (features[0].geometry.type === "Point") {
            var round = turf.buffer(features[0], 100, 'kilometers'),
                bbox = turf.bbox(round);
            map.fitBounds(bbox, {padding: 20});
        }

        document.getElementById("uuid").textContent = 'UUID: ' + id;

        features[0].properties.dtype.forEach(function(e){
            addType(document.getElementById('dropdown-menu').getElementsByClassName(e)[0].parentElement);
        })

        document.getElementById("disasterName").value = features[0].properties.name;
        document.getElementById("disasterPlace").value = features[0].properties.place;

        $("#disasterStartDate").datepicker("setDate", features[0].properties.dateStart);
        if (features[0].properties.dateEnd === ''){
            $("#dateCheckbox").prop('checked', true).change();
        } else {
            $("#disasterEndDate").datepicker("setDate", features[0].properties.dateEnd);
        }

        document.getElementById("disasterComments").value = features[0].properties.comments.replace(/<br\s?\/?>/g,"\n");
        closePopup();
    }
}
