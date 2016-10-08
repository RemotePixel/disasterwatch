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

function filterListDisaster() {
    "use strict";
    document.getElementsByClassName('list-disasters')[0].childNodes.forEach(function (e) {
        if (e.getAttribute('date-end') !== '' && document.getElementById('event-checkbox').checked) {
            e.className = 'list-element display-none';
        } else {
            e.className = 'list-element';
        }
    });

    if (document.getElementById('event-checkbox').checked) {
        var ptFilter = ["all", ["==", "$type", "Point"], ["==", "dateEnd", ""]],
            pgFilter = ["all", ["==", "$type", "Polygon"], ["==", "dateEnd", ""]];
    } else {
        var ptFilter = ["==", "$type", "Point"],
            pgFilter = ["==", "$type", "Polygon"];
    }

    map.setFilter("disasterdb-points", ptFilter);
    map.setFilter("disasterdb-polygons", pgFilter);
}


$("#event-checkbox").change(function () {
    "use strict";
    $("#event-checkbox").parent().toggleClass('green');
    filterListDisaster();
});



function filterListImage() {
    "use strict";
    var sat = $.map($(".sat-filter input:checked"), function (e) {
        return e.getAttribute('data');
    });

    document.getElementsByClassName('img-preview')[0].childNodes.forEach(function (e) {
        if (sat.indexOf(e.getAttribute('sat')) === -1) {
            e.className += ' display-none';
        } else {
            e.className = 'item';
        }
    });
}

$(".sat-filter input").change(function () {
    "use strict";
    filterListImage();
});

function resetForm() {
    "use strict";
    $(".dropdown-toggle").empty();
    $(".disaster-info .dropdown-menu i").each(function () {
        $(this).removeClass('right-block-in');
        $(this).addClass('right-block');
    });

    $(".disaster-info input").each(function () {
        $(this).val('');
    });

    $('.disaster-info input[type=checkbox]').each(function () {
        $(this).attr('checked', false);
    });

    $('.disaster-info .uuid').text('');
    $('.disaster-info textarea').val('');

    $("#disasterStartDate").datepicker('clearDates');
    $("#disasterEndDate").datepicker('clearDates');
}

function openleftBlock() {
    "use strict";

    $(".leftblock").addClass('in');
    $(".tab-selector-1").prop("checked", true);
    $("button[dwmenu]").each(function () {
        $(this).attr('disabled', true);
    });

    ['#settings-panel', '#settings-btn', '#basemaps-panel', '#basemaps-btn', '#disasters-panel', '#disasters-btn'].forEach(function (e) {
        $(e).removeClass('on');
    });

    map.resize();
}

function openImagesSettings() {
    "use strict";
    $(".openSettings").toggleClass('active');
    $(".disaster-images .sat-filter").toggleClass('active');
}

function closeleftblock() {
    "use strict";
    $(".leftblock").removeClass('in');
    $("button[dwmenu]").each(function () {
        $(this).attr('disabled', false);
    });

    $(".tab-selector-1").prop("checked", true);
    $(".tab-selector-1").removeClass('out');
    $(".tab-selector-2").removeClass('out');

    // $(".sat-filter input").prop('checked', true);
    $(".openSettings").removeClass('active');
    $(".disaster-images .sat-filter").removeClass('active');

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
    }).on("changeDate", function (e) {
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
            var sat = overlay.slice(0, 5);
            if (sat === 'VIIRS') {
                changeOverlay('MODIS_Terra_CorrectedReflectance_TrueColor');
            }
        }
        update_basemaps();
    });

    $(".date-button").datepicker('setDate', moment.utc().subtract(1, 'days').format('YYYY-MM-DD'));
    $("#slider").attr('disabled', 'disabled');
    // $('#modalUnderConstruction').modal();
});
