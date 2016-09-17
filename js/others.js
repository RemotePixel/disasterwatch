/*jslint browser: true*/
/*global $, jQuery, alert*/
/*global mapboxgl, mapboxgl, alert*/
/*global moment, moment, alert*/
/*global console, console, alert*/


//Disaster-info Form Interaction
function addType(elem) {
    "use strict";
    var type = elem.childNodes[0],
        dTypelist = document.getElementById("disasterType");

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

function resetForm() {
    "use strict";
    $(".dropdown-toggle").empty();
    $(".disaster-info .dropdown-menu i").each(function () {
        $(this).removeClass('right-block-in');
        $(this).addClass('right-block');
    });

    $(".disaster-info input").each( function () {
        $(this).val('');
    });

    $('.disaster-info input[type=checkbox]').each(function(){
        $(this).attr('checked', false);
    });

    $('.disaster-info .uuid').text('');
    $('.disaster-info textarea').val('');

    $("#disasterStartDate").datepicker('clearDates')
    $("#disasterEndDate").datepicker('clearDates')
}

function editEvt(id) {
    openleftBlock();
    closePopup();

    $(".tab-selector-2").prop( "checked", true);
    $(".tab-selector-1").addClass('out');
    $(".tab-selector-2").addClass('out');

    //fill
    var features = map.getSource("disasterdb")._data.features.filter(function(e){
        return (e.properties.uuid === id);
    }),
        featureId = draw.add(features[0]);

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
}

function closeleftblock() {
    "use strict";
    $(".leftblock").removeClass('in');
    $("button[dwmenu]").each(function () {
        $(this).attr('disabled', false);
    });

    $(".tab-selector-1").prop( "checked", true );
    $(".tab-selector-1").removeClass('out');
    $(".tab-selector-2").removeClass('out');

    $('.img-preview').empty();
    resetForm();
    map.resize();
    draw.deleteAll();
}

////////////////////////////////////////////////////////////////////////////////

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
    $("#slider").attr('disabled', 'disabled');
    $('#modalUnderConstruction').modal();
});
