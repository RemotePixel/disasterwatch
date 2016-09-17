/*jslint browser: true*/
/*global $, jQuery, alert*/
/*global mapboxgl, mapboxgl, alert*/
/*global moment, moment, alert*/
/*global console, console, alert*/

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


function addDisastTodb() {
    "use strict";

    $('.disaster-info .spin').removeClass('display-none');
    $('.map .spin').removeClass('display-none');

    //Check for info validity ??N
    var features = draw.getAll(),
        geojson = features.features[0];

    delete geojson['id'];

    geojson.properties.uuid = generateUUID();
    geojson.properties.mailTO = (document.getElementById("mailCheckbox").checked)? document.getElementById("disastermailTo").value : '';
    geojson.properties.dtype = $('#disasterType').children().map(function(){
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
        console.log('Could not add Disaster Event to database');
    });

    resetForm();
    closeleftblock();
}

function updateDisastTodb() {
    "use strict";

    $('.disaster-info .spin').removeClass('display-none');
    $('.map .spin').removeClass('display-none');

    var features = draw.getAll(),
        geojson = features.features[0];

    delete geojson['id'];

    geojson.properties.mailTO = (document.getElementById("mailCheckbox").checked)? document.getElementById("disastermailTo").value : '';
    geojson.properties.dtype = $('#disasterType').children().map(function(){
        return this.className
    }).toArray();
    geojson.properties.name = document.getElementById("disasterName").value;
    geojson.properties.place = document.getElementById("disasterPlace").value;
    geojson.properties.dateStart = document.getElementById("disasterStartDate").value;
    geojson.properties.dateEnd = (document.getElementById("dateCheckbox").checked)? '' : document.getElementById("disasterEndDate").value;
    geojson.properties.comments = document.getElementById("disasterComments").value.replace(/\r?\n/g, '<br/>');

    $.ajax ({
        url: "https://shqxykh2td.execute-api.us-west-2.amazonaws.com/v1/update",
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
        console.log('Could not update Disaster Event to database');
    });

    resetForm();
    closeleftblock();
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
    closePopup();

    draw.deleteAll();
    if (draw.getMode() !== 'simple_select'){
        draw.changeMode('simple_select');
    }
    $(".tab-selector-2").prop( "checked", true);
    $(".tab-selector-1").addClass('out');
    $(".tab-selector-2").addClass('out');

    //fill
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

    document.getElementById("disasterComments").value = features[0].properties.comments.replace('<br/>', "\n");
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
