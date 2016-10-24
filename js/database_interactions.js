/*jslint browser: true*/
/*global $, jQuery, alert*/
/*global mapboxgl, mapboxgl, alert*/
/*global moment, moment, alert*/
/*global console, console, alert*/


var disasterwatchAPI = 'https://tcuraimo51.execute-api.us-east-1.amazonaws.com/test/';

function getDisasterdb(callback) {
    "use strict";

    $.get(disasterwatchAPI + "toGEOJSON")
        .done(function(data){
            map.getSource('disasterdb').setData(data);
            $('.list-disasters').scrollTop(0);
            $('.list-disasters').empty();
            for(var i = 0; i < data.features.length; i++) {
                var disasterType = (data.features[i].properties.dtype.length !== 0) ? data.features[i].properties.dtype[0] : 'unclassified';
                $('.list-disasters').append(
                    '<div class="list-element" dw-type="' + disasterType + '" date-start="' +  data.features[i].properties.dateStart + '" date-end="' + data.features[i].properties.dateEnd + '" target="_blank" onclick="mapFlyToDisaster(\'' + data.features[i].properties.uuid + '\')">'+
                        '<div class="col">' +
                            '<div class="disaster-descr"><div class="icon icon-' + disasterType + '" title="' + disasterType + '"></div></div>' +
                            '<div class="disaster-descr">'+
                                '<span class="dtitle">'+ data.features[i].properties.name +'</span>' +
                                '<span class="dplace">' + data.features[i].properties.place + '</span>' +
                            '</div>' +
                        '</div>' +
                    '</div>');
            }
            filterListDisaster();
            return callback(null, 'ready');
        });
}

function addDisastTodb() {
    "use strict";

    $('.disaster-info .spin').removeClass('display-none');
    $('.map .spin').removeClass('display-none');

    //Check for info validity ??N
    var features = draw.getAll(),
        geojson = features.features[0];

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

    $.ajax ({
        url: disasterwatchAPI + "add",
        type: "POST",
        data: JSON.stringify(geojson),
        dataType: "json",
        contentType: "application/json",
    })
    .success(function(data){
        getDisasterdb(function(err, res){
            if (err) throw error;
        });
    })
    .always(function () {
        resetForm();
        closeleftblock();
    })
    .fail(function () {
        console.log('Could not add Disaster Event to database');
    });
}

function updateDisastTodb() {
    "use strict";

    $('.disaster-info .spin').removeClass('display-none');
    $('.map .spin').removeClass('display-none');

    var features = draw.getAll(),
        geojson = features.features[0];

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

    delete geojson['nbfollowers'];

    geojson.properties.dtype = $('#disasterType span[type="dtype"]').map(function () {
        return this.className
    }).toArray();
    geojson.properties.name = document.getElementById("disasterName").value;
    geojson.properties.place = document.getElementById("disasterPlace").value;
    geojson.properties.dateStart = document.getElementById("disasterStartDate").value;
    geojson.properties.dateEnd = (document.getElementById("dateCheckbox").checked)? '' : document.getElementById("disasterEndDate").value;
    geojson.properties.comments  = document.getElementById("disasterComments").value.replace(/\n\r?/g, '<br />');

    $.ajax ({
        url: disasterwatchAPI + "update",
        type: "POST",
        data: JSON.stringify(geojson),
        dataType: "json",
        contentType: "application/json",
    })
    .success(function(data){
        getDisasterdb(function(err, res){
            if (err) throw error;
        });
    })
    .always(function () {
        $('.disaster-info .spin').addClass('display-none');
        $('.map .spin').addClass('display-none');
    })
    .fail(function () {
        console.log('Could not update Disaster Event to database');
    });

    resetForm();
    closeleftblock();
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

    $.ajax ({
        url: disasterwatchAPI + "subscribe",
        type: "POST",
        data: JSON.stringify(request),
        dataType: "json",
        contentType: "application/json",
    })
    .success(function(data){
        getDisasterdb(function(err, res){
            if (err) throw error;
        });
        closePopup();
        $('.mapboxgl-popup-content .subscribe-section .error').removeClass('on');
    })
    .always(function () {
        $('.map .spin').addClass('display-none');
    })
    .fail(function () {
        $('.mapboxgl-popup-content .subscribe-section .error').addClass('on');
        console.log('Could not update Disaster Event to database');
    });

}

function removeEvt(id) {
    "use strict";

    $('.map .spin').removeClass('display-none');
    $.ajax ({
        url: disasterwatchAPI + "remove",
        type: "POST",
        data: JSON.stringify({"uuid": id}),
        dataType: "json",
        contentType: "application/json",
    })
    .success(function(data){
        getDisasterdb(function(err, res){
            if (err) throw error;
        });
    })
    .always(function () {
        $('.map .spin').addClass('display-none');
    })
    .fail(function () {
        console.log('Could not remove Disaster Event to database');
    });
    closePopup();
}

function seeEvtDBimages(id) {
    "use strict";

    draw.deleteAll();
    openleftBlock();

    $(".tab-selector-1").addClass('out');
    $(".tab-selector-2").addClass('out');

    if (draw.getMode() !== 'static'){
        draw.changeMode('static');
    }

    var features = map.getSource("disasterdb")._data.features.filter(function(e){
        return (e.properties.uuid === id);
    }),
        featureId = draw.add(features[0]),
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

    getImages();
}


function editEvt(id) {
    openleftBlock();
    resetForm();
    closePopup();

    draw.deleteAll();
    if (draw.getMode() !== 'simple_select'){
        draw.changeMode('simple_select');
    }
    $(".tab-selector-2").prop( "checked", true);
    $(".tab-selector-1").addClass('out');
    $(".tab-selector-2").addClass('out');

    var features = map.getSource("disasterdb")._data.features.filter(function(e){
        return (e.properties.uuid === id);
    }),
        featureId = draw.add(features[0]);

    if (features[0].geometry.type === "LineString") {
        var bbox = turf.extent(features[0].geometry);
        map.fitBounds(bbox, {padding: 20});
    }

    if (features[0].geometry.type === "Point") {
        var round = turf.buffer(features[0], 100, 'kilometers'),
            bbox = turf.extent(round);
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
}

function mapFlyToDisaster(id) {
    "use strict";

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
