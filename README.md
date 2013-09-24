Leaflet.PathGrab
================

This plugin allows to detect mouse hovering events on lines, with a tolerance
distance.

It can also be used to grab intermediary points on a polyline, the same way
you choose intermediary steps on route maps.

Play with [online demo](http://makinacorpus.github.io/Leaflet.PathGrab/).

It requires [Leaflet.GeometryUtil](https://github.com/makinacorpus/Leaflet.GeometryUtil/) and [Leaflet.Snap](https://github.com/makinacorpus/Leaflet.Snap/).

Usage
-----

```javascript

    var map = L.map('map');
    ...
    var lines = L.geoJson(...);
    ...
    map.polylineGrab.addLayer(lines);

```

And add default stylesheet ``leaflet.pathgrab.css`` for grab markers.

### Events ###

* **attach** (marker, layer) : fired when a grab is attached to a line.
* **detach** (marker) : fired when a grab is detached from a line.

Additionally, events dedicated to line hovering:

* **grab:over** (latlng, layer) : fired when mouse is close to the line.
* **grab:move** (latlng, layer) : fired when mouse is moved.
* **grab:out** : fired when mouse is far.


Ideas
-----

* Make marker snapping / attaching optional (or split into 2 handlers)
* Control hovering and snapping distances from options


Authors
-------

[![Makina Corpus](http://depot.makina-corpus.org/public/logo.gif)](http://makinacorpus.com)
