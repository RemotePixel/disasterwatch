

[disasterwatch](http://disasterwatch.remotepixel.ca) is the new RemotePixel.ca project.

For this new project, I (RemotePixel) am looking for people to help me so please 
contact me @ contact@remotepixel.ca

####Project Status : Phase 1

- Phase 1: Defining structure and to do list
- Phase 2: Building BackEnd and FrontEnd
- Phase 3: Public Release

What
-------

Aim of this project is to ease access to satelite imagery where we need the most.

The project is based on two things: 
* A database of disaster (type, area/position, date, ...).
* A simple and elegant interface to visualize latest imagery available on each area.

Why
-------

With more and more free satellite imagery (Sentinel, Lansdat, ...) available
and low cost imagery service (UrtheCast, PlanetLab, ...), I believe it could 
help if we build a platform that ease the access to all the available
imagery ressources.


To Do
-------

* Back End:
  [ ] Create a nodejs server
  [ ] Create a database (ElasticSearch or MongoDB)
  [ ] Build a REST like service to add disaster to a database (GET, PUT)
  [ ] Build a REST like service to get imagery available (GET)
  
* Front End:
  [ ] Interface to visualize imagery quicklook and metadata.
  [ ] Interface to add disaster to the database (login required ?).
  [ ] Connect to other services like [OpenArialMap](http://openaerialmap.org).
  [ ] Add time.

Ressources
-------
- [Global Disaster Alert and Coordination System](http://www.gdacs.org)
- [globaldisasterwatch.blogspot.com](http://globaldisasterwatch.blogspot.ca)
- [Earth Report | Global Disaster Watch](https://elispiritweaver.wordpress.com)
- [Skytruth](http://skytruth.org)
- [Pacific Disaster Center](http://atlas.pdc.org/atlas/)
- [Pacific Disaster Center - Sources](http://ghin.pdc.org/ghin/catalog/search/browse/browse.page)
- [Emergency and Disaster Information Service](http://hisz.rsoe.hu)
