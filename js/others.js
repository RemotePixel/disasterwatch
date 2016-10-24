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

function filterType(elem) {
    "use strict";
    var type = elem.childNodes[0],
        dTypelist = document.getElementById("disasterType2");
    dTypelist.innerHTML = '<span class="caret"></span>' + type.outerHTML;
    filterListDisaster();
}

function filterListDisaster() {
    "use strict";
    var filterClass = $("#disasterType2 span[type='dtype']")[0].className;
    if (filterClass === 'all') {
        document.getElementsByClassName('list-disasters')[0].childNodes.forEach(function (e) {
            if (e.getAttribute('date-end') !== '' && document.getElementById('event-checkbox').checked) {
                e.className = 'list-element display-none';
            } else {
                e.className = 'list-element';
            }
        });
    } else {
        document.getElementsByClassName('list-disasters')[0].childNodes.forEach(function (e) {
            if ((e.getAttribute('date-end') !== '' && document.getElementById('event-checkbox').checked) || (e.getAttribute('dw-type') !== filterClass)) {
                e.className = 'list-element display-none';
            } else {
                e.className = 'list-element';
            }
        });
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
        $(".disaster-info .sat-filter input").attr('disabled', false);
    } else {
        $("#disastermailTo").attr('disabled', 'disabled');
        $(".disaster-info .sat-filter input").attr('disabled', 'disabled');
    }
});

$("#event-checkbox").change(function () {
    "use strict";
    $("#event-checkbox").parent().toggleClass('green');
    filterListDisaster();
});

function filterListImage() {
    "use strict";
    var sat = $.map($(".disaster-images .sat-filter input:checked"), function (e) {
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

function sortListImage() {
    "use strict";
    var list = $(".img-preview").children();
    list.sort(sortScenes);
    list.detach().appendTo($(".img-preview"));
}

$(".disaster-images .sat-filter input").change(function () {
    "use strict";
    filterListImage();
});

function resetForm() {
    "use strict";
    // $(".dropdown-toggle").empty();
    $('#disasterType span[type="dtype"]').remove()
    $(".disaster-info .dropdown-menu i").each(function () {
        $(this).removeClass('right-block-in');
        $(this).addClass('right-block');
    });

    $(".disaster-info input").val('');
    $('.disaster-info input[type=checkbox]').prop('checked', false);

    $(".disaster-info .sat-filter input").attr('disabled', 'disabled');
    $(".disaster-info .sat-filter input[type=checkbox]").prop('checked', true);

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

    ['#layers-panel', '#layers-btn', '#basemaps-panel', '#basemaps-btn', '#disasters-panel', '#disasters-btn'].forEach(function (e) {
        $(e).removeClass('on');
    });

    map.resize();
}

function openImagesSettings() {
    "use strict";
    $(".opensettings").toggleClass('active');
    $(".disaster-images .sat-filter").toggleClass('active');
}

function closeleftblock() {
    "use strict";

    $('.disaster-images .spin').addClass('display-none');
    $('.map .spin').addClass('display-none');

    $(".leftblock").removeClass('in');
    $("button[dwmenu]").each(function () {
        $(this).attr('disabled', false);
    });

    $(".tab-selector-1").prop("checked", true);
    $(".tab-selector-1").removeClass('out');
    $(".tab-selector-2").removeClass('out');

    // $(".disaster-images .sat-filter input").prop('checked', true);
    $(".opensettings").removeClass('active');
    $(".disaster-images .sat-filter").removeClass('active');

    $('.img-preview').empty();
    resetForm();
    map.resize();
    draw.deleteAll();
}

////////////////////////////////////////////////////////////////////////////////

function toggleHelp() {
    $(".dwhelp-block").toggleClass('on');
}

function toggleImageryOption() {
    $(".bottom-right-control").toggleClass('on');
}

function toggleSubscribe() {
    $(".subscribe-section").toggleClass('display-none');
}

function toggleSearch() {
    $('.geocoder-container').toggleClass('in');
    $('.geocoder-container input').focus();
}

function toggleParam(setting) {
    "use strict";
    switch (setting) {
    case 'basemaps':
        $("#basemaps-panel .side-view-content").scrollTop(0);
        $('#layers-panel').removeClass('on');
        $('#layers-btn').removeClass('on');
        $('#disasters-panel').removeClass('on');
        $('#disasters-btn').removeClass('on');
        $('#basemaps-panel').toggleClass('on');
        $('#basemaps-btn').toggleClass('on');
        break;

    case 'layers':
        $('#basemaps-panel').removeClass('on');
        $('#basemaps-btn').removeClass('on');
        $('#disasters-panel').removeClass('on');
        $('#disasters-btn').removeClass('on');
        $('#layers-panel').toggleClass('on');
        $('#layers-btn').toggleClass('on');
        break;

    case 'disasterslist':
        $("#disasters-panel .side-view-content").scrollTop(0);
        $('#basemaps-panel').removeClass('on');
        $('#basemaps-btn').removeClass('on');
        $('#layers-panel').removeClass('on');
        $('#layers-btn').removeClass('on');
        $('#disasters-panel').toggleClass('on');
        $('#disasters-btn').toggleClass('on');
        break;

    case 'add':
        $('#layers-panel').removeClass('on');
        $('#layers-btn').removeClass('on');
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
});
