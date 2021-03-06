
const getDisasterdb = (callback) => {

    $('#disasters-panel .spin2').removeClass('display-none');
    $('.list-disasters').scrollTop(0);
    $('.list-disasters').empty();

    $.get(`${disasterwatch_api_url}/database/toGEOJSON`, (data) => {

        map.getSource('disasterdb').setData(data);

        for(let i = 0; i < data.features.length; i++) {
            $('.list-disasters').append(
                `<div class="list-element" dw-type="${data.features[i].properties.icon}" date-start="${data.features[i].properties.dateStart}" date-end="${data.features[i].properties.dateEnd}" target="_blank" onclick="mapFlyToDisaster('${data.features[i].properties.uuid}')">` +
                    '<div class="col">' +
                        '<div class="disaster-descr">' +
                            `<div class="icon icon-${data.features[i].properties.icon}" title="${data.features[i].properties.icon}"></div>` +
                        '</div>' +
                        '<div class="disaster-descr">'+
                            `<span class="dtitle">${data.features[i].properties.name}</span>` +
                            `<span class="dplace">${data.features[i].properties.place}</span>` +
                        '</div>' +
                    '</div>' +
                '</div>');
        }

        filterListDisaster();

        $('#disasters-panel .spin2').addClass('display-none');
        return callback(null, 'ready');
    })
        .fail(() => {
            return callback('Could not retrieve the database');
        });
};

const addDisastTodb = () => {

    const features = draw.getAll();
    const geojson = features.features[0];

    if (geojson.geometry.type === 'Polygon') {
        if (turf.area(geojson) >= 1e11) {
            $('#modalPolySize').modal();
            return;
        }
    }

    $('.disaster-info button[type="submit"]').attr('disabled', true);
    $('.map .spin').removeClass('display-none');

    delete geojson['id'];

    geojson.properties.uuid = generateUUID();

    if (document.getElementById('mailCheckbox').checked) {
        const sat = $.map($('.disaster-info .sat-filter input:checked'), (e) => {
            return e.getAttribute('data');
        });

        geojson.properties.mail = {
            'mail': document.getElementById('disastermailTo').value,
            'satellite': sat
        };
    } else {
        geojson.properties.mail = null;
    }

    geojson.properties.dtype = $('#disasterType span[type="dtype"]').map(function () {
        return this.className;
    }).toArray();

    geojson.properties.icon = (geojson.properties.dtype.length !== 0) ? geojson.properties.dtype[0] : 'unclassified';
    geojson.properties.name = document.getElementById('disasterName').value;
    geojson.properties.place = document.getElementById('disasterPlace').value;
    geojson.properties.dateStart = document.getElementById('disasterStartDate').value;
    geojson.properties.dateEnd = (document.getElementById('dateCheckbox').checked)? '' : document.getElementById('disasterEndDate').value;
    geojson.properties.comments  = document.getElementById('disasterComments').value.replace(/\n\r?/g, '<br />');

    geojson.properties.images = {
        'landsat8': ($('.img-preview [sat="landsat8"]').first().attr('img-date'))? $('.img-preview [sat="landsat8"]').first().attr('img-date') : moment.utc().subtract(15,'days').format('YYYY-MM-DD'),
        'sentinel2': ($('.img-preview [sat="sentinel2"]').first().attr('img-date'))? $('.img-preview [sat="sentinel2"]').first().attr('img-date') : moment.utc().subtract(15,'days').format('YYYY-MM-DD'),
        'sentinel1': ($('.img-preview [sat="sentinel1"]').first().attr('img-date'))? $('.img-preview [sat="sentinel1"]').first().attr('img-date') : moment.utc().subtract(15,'days').format('YYYY-MM-DD'),
    };

    $.ajax({
        url: `${disasterwatch_api_url}/database/add`,
        type: 'POST',
        data: JSON.stringify(geojson),
        dataType: 'json',
        contentType: 'application/json',
    })
        .success(() => {
            getDisasterdb((err) => {
                if (err) $('#modalDBerror').modal();
                closeleftblock();
                $('.map .spin').addClass('display-none');
            });
        })
        .fail(() => {
            $('.disaster-info .error').addClass('on');
            $('.disaster-info button[type="submit"]').attr('disabled', false);
            $('.map .spin').addClass('display-none');
        });
};

const updateDisastTodb = () => {

    const features = draw.getAll();
    const geojson = features.features[0];

    if (geojson.geometry.type === 'Polygon') {
        if (turf.area(geojson) >= 1e11) {
            $('#modalPolySize').modal();
            return;
        }
    }

    $('.disaster-info button[type="submit"]').attr('disabled', true);
    $('.map .spin').removeClass('display-none');

    delete geojson['id'];

    if (document.getElementById('mailCheckbox').checked) {
        const sat = $.map($('.disaster-info .sat-filter input:checked'), (e) => {
            return e.getAttribute('data');
        });
        geojson.properties.mail = {
            'mail': document.getElementById('disastermailTo').value,
            'satellite': sat
        };
    } else {
        geojson.properties.mail = null;
    }

    delete geojson.properties['nbfollowers'];

    geojson.properties.dtype = $('#disasterType span[type="dtype"]').map(function () {
        return this.className;
    }).toArray();

    geojson.properties.icon = (geojson.properties.dtype.length !== 0) ? geojson.properties.dtype[0] : 'unclassified';
    geojson.properties.name = document.getElementById('disasterName').value;
    geojson.properties.place = document.getElementById('disasterPlace').value;
    geojson.properties.dateStart = document.getElementById('disasterStartDate').value;
    geojson.properties.dateEnd = (document.getElementById('dateCheckbox').checked)? '' : document.getElementById('disasterEndDate').value;
    geojson.properties.comments  = document.getElementById('disasterComments').value.replace(/\n\r?/g, '<br />');

    $.ajax({
        url: `${disasterwatch_api_url}/database/update`,
        type: 'POST',
        data: JSON.stringify(geojson),
        dataType: 'json',
        contentType: 'application/json',
    })
        .success(() => {
            getDisasterdb((err) => {
                if (err) $('#modalDBerror').modal();
                closeleftblock();
                $('.map .spin').addClass('display-none');
            });
        })
        .fail(() => {
            $('.disaster-info .error').addClass('on');
            $('.disaster-info button[type="submit"]').attr('disabled', false);
            $('.map .spin').addClass('display-none');
        });
};

const subscribeEvt = (elem) => {
    $('.map .spin').removeClass('display-none');

    const div = $(elem).parent();
    const uuid = div.attr('data-uuid');
    const sat = $.map($(div).find('.sat-filter input:checked'), function (e) {
        return e.getAttribute('data');
    });
    const mail = {
        'mail': $(div).find('input[type="email"]').val(),
        'satellite': sat
    };
    const request = {
        'uuid': uuid,
        'mail' : mail
    };

    $.ajax({
        url: `${disasterwatch_api_url}/database/subscribe`,
        type: 'POST',
        data: JSON.stringify(request),
        dataType: 'json',
        contentType: 'application/json',
    })
        .success(() => {
            closePopup();
            getDisasterdb((err) => {
                if (err) $('#modalDBerror').modal();
                $('.map .spin').addClass('display-none');
            });
        })
        .fail(() => {
            $('.map .spin').addClass('display-none');
            $('.mapboxgl-popup-content .subscribe-section .error').addClass('on');
        });

};

const removeEvt = (id) => {
    $('.map .spin').removeClass('display-none');

    $.ajax({
        url: `${disasterwatch_api_url}/database/remove`,
        type: 'POST',
        data: JSON.stringify({'uuid': id}),
        dataType: 'json',
        contentType: 'application/json',
    })
        .success(() => {
            getDisasterdb((err) => {
                if (err) $('#modalDBerror').modal();
                closePopup();
                $('.map .spin').addClass('display-none');
            });
        })
        .fail(() => {
            $('.mapboxgl-popup-content .db-error').addClass('on');
        });
};

const seeEvtDBimages = (id) => {

    const features = map.getSource('disasterdb')._data.features.filter((e) => {
        return (e.properties.uuid === id);
    });

    if (features.length === 0) {
        $('#modalError').modal();
    } else {
        draw.deleteAll();
        openleftBlock();

        $('.tab-selector-1').addClass('out');
        $('.tab-selector-2').addClass('out');

        if (draw.getMode() !== 'static') draw.changeMode('static');
        draw.add(features[0]);

        const drawfeat = draw.getAll();
        let bbox;
        if (drawfeat.features[0].geometry.type === 'Point') {
            let round = turf.buffer(drawfeat.features[0], 100, 'kilometers');
            bbox = turf.bbox(round);
        } else {
            bbox = turf.bbox(drawfeat.features[0].geometry);
        }
        map.fitBounds(bbox, {padding: 20});

        getImages();
        closePopup();
    }
};

const editEvt = (id) => {

    const features = map.getSource('disasterdb')._data.features.filter(function(e){
        return (e.properties.uuid === id);
    });

    if (features.length === 0) {
        $('#modalError').modal();
    } else {
        resetForm();
        openleftBlock();

        draw.deleteAll();
        if (draw.getMode() !== 'simple_select') draw.changeMode('simple_select');

        $('.tab-selector-2').prop( 'checked', true);
        $('.tab-selector-1').addClass('out');
        $('.tab-selector-2').addClass('out');

        draw.add(features[0]);

        let bbox;
        if (features[0].geometry.type === 'Point') {
            let round = turf.buffer(features[0], 100, 'kilometers');
            bbox = turf.bbox(round);
        } else {
            bbox = turf.bbox(features[0].geometry);
        }

        map.fitBounds(bbox, {padding: 20});

        document.getElementById('uuid').textContent = 'UUID: ' + id;

        features[0].properties.dtype.forEach((e) => {
            addType(document.getElementById('dropdown-menu').getElementsByClassName(e)[0].parentElement);
        });

        document.getElementById('disasterName').value = features[0].properties.name;
        document.getElementById('disasterPlace').value = features[0].properties.place;

        $('#disasterStartDate').datepicker('setDate', features[0].properties.dateStart);
        if (features[0].properties.dateEnd === ''){
            $('#dateCheckbox').prop('checked', true).change();
        } else {
            $('#disasterEndDate').datepicker('setDate', features[0].properties.dateEnd);
        }

        document.getElementById('disasterComments').value = features[0].properties.comments.replace(/<br\s?\/?>/g,'\n');
        closePopup();
    }
};
