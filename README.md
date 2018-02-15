
[disasterwatch](http://disasterwatch.remotepixel.ca) is the new RemotePixel.ca project ( [post](http://remotepixel.ca/blog/disasterwatch-20151231.html)).

For this new project, I (RemotePixel) am looking for people to help me so please
contact me @ contact@remotepixel.ca


What
-------

Aim of this project is to ease access to satelite imagery where we need it the most.

The project is based on three things:
* A database of disaster (type, area/position, date, ...).
* A simple and elegant interface to visualize latest imagery available on each area.
* Email based notifications to get information when a new image is available over a disaster area

Why
-------

With more and more free satellite imagery (Sentinel, Lansdat, ...) available
and low cost imagery service (UrtheCast, Planet...), I believe it could
help if we build a platform that ease the access to all the available
imagery ressources.

##### Ressources
- [Global Disaster Alert and Coordination System](http://www.gdacs.org)
- [globaldisasterwatch.blogspot.com](http://globaldisasterwatch.blogspot.ca)
- [Earth Report | Global Disaster Watch](https://elispiritweaver.wordpress.com)
- [Skytruth](http://skytruth.org)
- [Pacific Disaster Center](http://atlas.pdc.org/atlas/)
- [Pacific Disaster Center - Sources](http://ghin.pdc.org/ghin/catalog/search/browse/browse.page)
- [Emergency and Disaster Information Service](http://hisz.rsoe.hu)


#### Create `app.min.js`

You need to create the `/js/config.js` file with some api url and token:
```
const rpix_api_us = '{RPIX-US-URL}'; //https://github.com/RemotePixel/remotepixel-api
const rpix_api_eu = '{RPIX-EU-URL}'; //https://github.com/RemotePixel/remotepixel-api
const landsat_tiler_url = '{LANDSAT-TILER}'; //https://github.com/remotepixel/remotepixel-tiler
const sentinel_tiler_url = '{SENTINEL-TILER}'; //https://github.com/remotepixel/remotepixel-tiler
const volcanoes_api_url ='https://joqhmu5n9g.execute-api.us-east-1.amazonaws.com/production';
const disasterwatch_api_url = '{DW-API}'; //https://github.com/RemotePixel/disasterwatch-lambda
const sat_api_url = 'https://api.developmentseed.org/satellites/';
const MAPBOX_ACCESS_TOKEN = '{YOUR-TOKEN}';
const ENDPOINT_TOKEN = '{YOUR-TOKEN}';
```

```
npm install uglify-es -g
cd js/
cat config.js database_interactions.js external_data.js images_download.js map.js others.js utils.js > app.js
uglifyjs app.js > app.min.js
```
