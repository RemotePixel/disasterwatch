
master branch is live on [http://disasterwatch.remotepixel.ca](http://disasterwatch.remotepixel.ca)

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

TimeFrame
-------

- V1 will show only Landsat-8 and Sentinel-2 image

###### UI Preview
![preview](https://cloud.githubusercontent.com/assets/10407788/18424407/409061fe-787d-11e6-950c-5615274a3222.gif)

To Do
-------

##### Front End:
- [*] UI to visualize imagery quicklook and metadata.
- [*] UI to add disaster to the database.

##### Back End (AWS Lambda based):
- [*] Create a database (Geojson) read/write/update functions
- [ ] Mailing function

##### Things to be added after V1:
- other imagery sources (UrtheCast, Planet, ...)

##### Ressources
- [Global Disaster Alert and Coordination System](http://www.gdacs.org)
- [globaldisasterwatch.blogspot.com](http://globaldisasterwatch.blogspot.ca)
- [Earth Report | Global Disaster Watch](https://elispiritweaver.wordpress.com)
- [Skytruth](http://skytruth.org)
- [Pacific Disaster Center](http://atlas.pdc.org/atlas/)
- [Pacific Disaster Center - Sources](http://ghin.pdc.org/ghin/catalog/search/browse/browse.page)
- [Emergency and Disaster Information Service](http://hisz.rsoe.hu)
