
////////////////////////////////////////////////////////////////////////////////
//From Libra by developmentseed (https://github.com/developmentseed/libra)
const zeroPad = (n, c) => {
    const s = String(n);
    if (s.length < c) return zeroPad('0' + n, c);
    return s;
};

const sortScenes = (a, b) => {
    return Date.parse(b.getAttribute('img-date')) - Date.parse(a.getAttribute('img-date'));
};

const closePopup = () => {
    $('.mapboxgl-popup-close-button').click();
};

const textTolink = (text) => {
    const patt = new RegExp('^(http)|(www)');
    if (patt.test(text)){
        return '<a href="' + text + '" target="_blank">' + text + '</a>';
    } else {
        return '<span>' + text + '</span>';
    }
};

////////////////////////////////////////////////////////////////////////////////
//from http://jsfiddle.net/briguy37/2MVFd/
const generateUUID = () => {
    let d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c=='x' ? r : (r&0x3 | 0x8)).toString(16);
    });
    return uuid;
};

const getUrlVars = () => {
    const vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
        vars[key] = value;
    });
    return vars;
};

const parse_landsat_product_id = (landsat_product) => {

    const info = landsat_product.split('_');
    return {
        satellite: info[0].slice(0,1) + info[0].slice(3),
        sensor:  info[0].slice(1,2),
        correction_level: info[1],
        path: info[2].slice(0,3),
        row: info[2].slice(3),
        acquisition_date: info[3],
        ingestion_date: info[4],
        collection: info[5],
        category: info[6]
    };
};

const parse_s2_tile = (tile) => {
    return {
        uz : tile.slice(0, 2),
        lb : tile.slice(2, 3),
        sq : tile.slice(3, 5)
    };
};

const s2_name_to_key = (scene) => {
    const info = scene.split('_');
    const acquisitionDate = info[2];
    const tile_info = parse_s2_tile(info[3]);
    const num = info[4];

    return [
        tile_info.uz,
        tile_info.lb,
        tile_info.sq,
        acquisitionDate.slice(0,4),
        acquisitionDate.slice(4,6).replace(/^0+/, ''),
        acquisitionDate.slice(6,8).replace(/^0+/, ''),
        num
    ].join('/');
};
