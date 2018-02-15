
$('#dateCheckbox').change(function () {
    if (this.checked) {
        $('#disasterEndDate').attr('disabled', 'disabled');
    } else {
        $('#disasterEndDate').attr('disabled', false);
    }
});

$('#mailCheckbox').change(function () {
    if (this.checked) {
        $('#disastermailTo').attr('disabled', false);
        $('.disaster-info .sat-filter input').attr('disabled', false);
    } else {
        $('#disastermailTo').attr('disabled', 'disabled');
        $('.disaster-info .sat-filter input').attr('disabled', 'disabled');
    }
});

//Disaster-info Form Interaction
const addType = (elem) => {
    const type = elem.childNodes[0];
    const dTypelist = document.getElementById('disasterType');

    if (dTypelist.getElementsByClassName(type.className).length !== 0) {
        var onList = dTypelist.getElementsByClassName(type.className);
        dTypelist.removeChild(onList[0]);
        elem.childNodes[1].className = 'fa fa-check right-block';
    } else {
        elem.childNodes[1].className = 'fa fa-check right-block-in';
        dTypelist.appendChild(type.cloneNode(true));
    }
};

const filterType = (elem) => {
    const type = elem.childNodes[0];
    const dTypelist = document.getElementById('disasterType2');
    dTypelist.innerHTML = '<span class="caret"></span>' + type.outerHTML;
    filterListDisaster();
};

const filterListDisaster = () => {
    $('.list-disasters .list-element').removeClass('display-none');
    map.setFilter('disasterdb-points', ['in', '$type', 'Point', 'LineString', 'Polygon']);
    map.setFilter('disasterdb-lines', ['==', '$type', 'LineString']);
    map.setFilter('disasterdb-polygons', ['==', '$type', 'Polygon']);

    const filterClass = $('#disasterType2 span[type="dtype"]')[0].className;
    if (filterClass === 'all') {
        if (!document.getElementById('event-checkbox').checked) {
            $('.list-disasters .list-element[date-end!=""]').addClass('display-none');
            map.setFilter('disasterdb-points', ['all', ['in', '$type', 'Point', 'LineString', 'Polygon'], ['==', 'dateEnd', '']]);
            map.setFilter('disasterdb-lines', ['all', ['==', '$type', 'LineString'], ['==', 'dateEnd', '']]);
            map.setFilter('disasterdb-polygons', ['all', ['==', '$type', 'Polygon'], ['==', 'dateEnd', '']]);
        }
    } else {
        $(`.list-disasters .list-element[dw-type!="${filterClass}"]`).addClass('display-none');
        if (!document.getElementById('event-checkbox').checked) {
            $('.list-disasters .list-element[date-end!=""]').addClass('display-none');
            map.setFilter('disasterdb-points', ['all', ['in', '$type', 'Point', 'LineString', 'Polygon'], ['==', 'dateEnd', ''], ['==', 'icon', filterClass]]);
            map.setFilter('disasterdb-lines', ['all', ['==', '$type', 'LineString'], ['==', 'dateEnd', ''], ['==', 'icon', filterClass]]);
            map.setFilter('disasterdb-polygons', ['all', ['==', '$type', 'Polygon'], ['==', 'dateEnd', ''], ['==', 'icon', filterClass]]);
        } else {
            map.setFilter('disasterdb-points', ['all', ['in', '$type', 'Point', 'LineString', 'Polygon'], ['==', 'icon', filterClass]]);
            map.setFilter('disasterdb-lines', ['all', ['==', '$type', 'LineString'], ['==', 'icon', filterClass]]);
            map.setFilter('disasterdb-polygons', ['all', ['==', '$type', 'Polygon'], ['==', 'icon', filterClass]]);
        }
    }
};

const filterListImage = () => {
    const sat2show = $.map($('.disaster-images .sat-filter input:checked'), (e) => {
        return e.getAttribute('data');
    });

    const sat2check = $.map($('.disaster-images .sat-filter input'), (e) => {
        return e.getAttribute('data');
    });

    sat2check.forEach((e) => {
        if (sat2show.indexOf(e) === -1) {
            $(`.img-preview div[sat="${e}"]`).addClass('display-none');
        } else {
            $(`.img-preview div[sat="${e}"]`).removeClass('display-none');
        }
    });
};

const sortListImage = () => {
    const list = $('.img-preview').children();
    list.sort(sortScenes);
    list.detach().appendTo($('.img-preview'));
};

$('#event-checkbox').change(() => {
    $('#event-checkbox').parent().toggleClass('green');
    filterListDisaster();
});


$('.disaster-images .sat-filter input').change(() => {
    filterListImage();
});

const resetForm = () => {
    $('.disaster-info button[type="submit"]').attr('disabled', false);

    $('#disasterType span[type="dtype"]').remove();
    $('.disaster-info .dropdown-menu i').each(function () {
        $(this).removeClass('right-block-in');
        $(this).addClass('right-block');
    });

    $('.disaster-info input').val('');
    $('.disaster-info input[type=checkbox]').prop('checked', false);

    $('.disaster-info .sat-filter input').attr('disabled', 'disabled');
    $('.disaster-info .sat-filter input[type=checkbox]').prop('checked', true);

    $('.disaster-info .uuid').text('');
    $('.disaster-info textarea').val('');

    $('.disaster-info .error').removeClass('on');

    $('#disasterStartDate').datepicker('clearDates');
    $('#disasterEndDate').datepicker('clearDates');

    $('.disaster-info').scrollTop(0);
};

const openleftBlock = () => {

    $('.leftblock').addClass('in');
    $('.tab-selector-1').prop('checked', true);
    $('button[dwmenu]').each(function () {
        $(this).attr('disabled', true);
    });

    ['#layers-panel', '#layers-btn', '#basemaps-panel', '#basemaps-btn', '#disasters-panel', '#disasters-btn'].forEach((e) => {
        $(e).removeClass('on');
    });

    map.resize();
};

const openImagesSettings = () => {
    $('.opensettings').toggleClass('active');
    $('.disaster-images .sat-filter').toggleClass('active');
};

const closeleftblock = () => {
    $('.disaster-images .spin').addClass('display-none');

    $('.leftblock').removeClass('in');
    $('button[dwmenu]').each(function () {
        $(this).attr('disabled', false);
    });

    $('.tab-selector-1').prop('checked', true);
    $('.tab-selector-1').removeClass('out');
    $('.tab-selector-2').removeClass('out');

    $('.opensettings').removeClass('active');
    $('.disaster-images .sat-filter').removeClass('active');

    $('.img-preview').empty();

    resetForm();

    map.resize();
    draw.deleteAll();
};

////////////////////////////////////////////////////////////////////////////////

const toggleHelp = () => {
    $('.dwhelp-block').toggleClass('on');
};

const toggleImageryOption = () => {
    $('.bottom-right-control-basemap').toggleClass('off');
};

const toggleTileOption = () => {
    $('.bottom-right-control-tiles').toggleClass('off');
};


const toggleSubscribe = () => {
    $('.subscribe-section').toggleClass('display-none');
};

const toggleSearch = () => {
    $('.geocoder-container').toggleClass('in');
    $('.geocoder-container input').focus();
};

const toggleParam = (setting) => {
    switch (setting) {
    case 'basemaps':
        $('#basemaps-panel .side-view-content').scrollTop(0);
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
        $('#disasters-panel .side-view-content').scrollTop(0);
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
};

$(document).ready(() => {
    $('#disasterStartDate').datepicker({
        format : 'yyyy-mm-dd',
        autoclose : true,
        todayHighlight : true,
        startDate : '2016-01-01',
        endDate : moment.utc().format('YYYY-MM-DD')
    }).on('changeDate', (e) => {
        const dateValue = moment(e.date).format('YYYY-MM-DD');
        $('#disasterEndDate').datepicker('setStartDate', dateValue);
        $('#disasterEndDate').datepicker('setDate', dateValue);
    });

    $('#disasterEndDate').datepicker({
        format : 'yyyy-mm-dd',
        autoclose : true,
        todayHighlight : true,
        startDate : '2016-01-01',
        endDate : moment.utc().format('YYYY-MM-DD')
    });

    $('.date-button').datepicker({
        format : 'yyyy-mm-dd',
        autoclose : true,
        todayHighlight : true,
        startDate : '2012-05-08',
        endDate : moment.utc().format('YYYY-MM-DD')
    }).on('changeDate', (e) => {
        const dateValue = moment(e.date).format('YYYY-MM-DD');
        const overlay = document.getElementsByClassName('link-on on')[0].parentElement.getAttribute('id');

        $('.date-button').text(dateValue);

        if (moment(dateValue).isBefore('2015-11-24')) {
            var sat = overlay.slice(0, 5);
            if (sat === 'VIIRS') changeOverlay('MODIS_Terra_CorrectedReflectance_TrueColor');
        }
        update_basemaps();
    });

    $('.date-button').datepicker('setDate', moment.utc().subtract(1, 'days').format('YYYY-MM-DD'));
    $('#slider').attr('disabled', 'disabled');
});
