
const MAPBOX_ACCESS_TOKEN = '{YOUR-TOKEN}';
const disasterwatch_api_url = '{DW-API}'; //https://github.com/RemotePixel/disasterwatch-lambda

const getUrlVars = () => {
    const vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
        vars[key] = value;
    });
    return vars;
};

const unsubscribe = () => {

    $('.btn-unsub').addClass('on');

    const request = {
        'uuid': $('#uuid i').text(),
        'mail' : $('#email i').text()
    };

    $.ajax ({
        url: `${disasterwatch_api_url}/database/unsubscribe`,
        type: 'POST',
        data: JSON.stringify(request),
        dataType: 'json',
        contentType: 'application/json',
    })
        .success(() => {
            $('.btn-unsub span').text('Done');
            $('.btn-unsub').removeClass('on');
            $('.btn-unsub').addClass('done');
        })
        .fail(() => {
            $('.btn-unsub').removeClass('on');
            $('.btn-unsub').addClass('error');
            $('.btn-unsub span').text('Error');
        });
};

const keys = getUrlVars();
if (keys.hasOwnProperty('uuid') && keys.hasOwnProperty('mail') ) {
    $('#uuid i').text(keys.uuid);
    $('#email i').text(keys.mail);

    $.ajax ({
        url: `${disasterwatch_api_url}/database/getEvent`,
        type: 'GET',
        data: {'uuid': keys.uuid},
        dataType: 'json',
        contentType: 'application/json',
    })
        .success((data) => {
            $('#name i').text(data.features[0].properties.name);

            let llstr;
            if (data.features[0].geometry.type === 'Polygon') {
                let centroid = turf.centroid(data);
                llstr = centroid.geometry.coordinates[0] + ',' + centroid.geometry.coordinates[1] + ',6';
            }

            if (data.features[0].geometry.type === 'Point') {
                llstr = data.features[0].geometry.coordinates[0] + ',' + data.features[0].geometry.coordinates[1] + ',9';
            }

            const url = 'https://api.mapbox.com/v4/mapbox.light/geojson(' + encodeURIComponent(JSON.stringify(data.features[0])) + ')/' + llstr + '/800x800@2x.png?attribution=true&access_token=' + MAPBOX_ACCESS_TOKEN;
            $('.map-pane img').attr('src', url);
        })
        .fail(() => {
            console.warn('Could not Retrieve Disaster Event to database');
        })
        .always(() => {
            $('.map-pane .spin').addClass('display-none');
        });
} else {
    $('.map-pane .spin').addClass('display-none');
}
