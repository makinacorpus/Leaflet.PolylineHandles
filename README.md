Leaflet.PolylineHandles
=======================

This plugin allows to grab intermediary points ("handles") on a polyline,
and snap them around the same way you choose intermediary steps on route maps.

Play with [online demo](https://makinacorpus.github.io/Leaflet.PolylineHandles/).

It requires:

* [Leaflet.AlmostOver](https://github.com/makinacorpus/Leaflet.AlmostOver/) (which
  itself requires [Leaflet.GeometryUtil](https://github.com/makinacorpus/Leaflet.GeometryUtil/)).
* [Leaflet.Snap](https://github.com/makinacorpus/Leaflet.Snap/).


Usage
-----

Add default stylesheet ``leaflet.polylinehandles.css`` for handles markers.

**Depending on your needs** :

Allow handles on **one path**, and snapping on **the same path** :


```javascript

    var path = L.polyline(...);
    ...

    map.almostOver.addLayer(path);

    path.polylineHandles.addGuideLayer(path);
    path.polylineHandles.enable();

```

Allow handles on **one path**, and snapping on **all paths** :

```javascript

    var lines = L.geoJson(...);
    var path = lines.getLayers()[0];  // arbitrary
    ...

    map.almostOver.addLayer(path);

    path.polylineHandles.addGuideLayer(lines);
    path.polylineHandles.enable();

```

Allow handles on **all paths**, and snapping on **all paths** :

```javascript

    var lines = L.geoJson(...);

    lines.eachLayer(function (l) {

        map.almostOver.addLayer(l);
        l.polylineHandles.addGuideLayer(lines);
        l.polylineHandles.enable();
    });

```


### Events ###

* **attach** (marker, layer) : fired when a handle is attached to a line.
* **detach** (marker) : fired when a handle is detached from a line.



Authors
-------

[![Makina Corpus](http://depot.makina-corpus.org/public/logo.gif)](http://makinacorpus.com)

This was first implemented in the [Geotrek](https://github.com/makinacorpus/Geotrek/)
project by [Simon Thépot](https://github.com/djcoin/).

It is greatly inspired by [OSM Routing machine](http://map.project-osrm.org/) and *Google Maps*.
