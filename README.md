
v1 branch is live on [http://disasterwatch.remotepixel.ca](http://disasterwatch.remotepixel.ca)

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

```
npm install uglify-es -g

cat config.js database_interactions.js external_data.js images_download.js map.js others.js utils.js > app.js
uglifyjs app.js > app.min.js
```
