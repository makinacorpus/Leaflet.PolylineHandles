Leaflet.PathGrab
================

This plugin allows to grab intermediary points on a polyline, the same way
you choose intermediary steps on route maps.

It can also be used to detect mouse hovering events on lines, with a tolerance
distance.

Play with [online demo](http://makinacorpus.github.io/Leaflet.PathGrab/).


Usage
-----

```javascript

    var map = L.map('map');
    ...
    var lines = L.geoJson(...);
    ...
    map.polylineGrab.addLayer(lines);

```

### Events ###

* **attach** (marker, layer) : fired when a grab is attached to a line.
* **detach** (marker) : fired when a grab is detached from a line.

Additionally, events dedicated to line hovering:

* **grab:on** (latlng, layer) : fired when mouse is close to the line.
* **grab:move** (latlng, layer) : fired when mouse is moved.
* **grab:off** : fired when mouse is far.


Authors
-------

[![Makina Corpus](http://depot.makina-corpus.org/public/logo.gif)](http://makinacorpus.com)
