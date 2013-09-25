Leaflet.PathGrab
================

This plugin allows to grab intermediary points on a polyline, the same way
you choose intermediary steps on route maps.

Play with [online demo](http://makinacorpus.github.io/Leaflet.PathGrab/).

It requires:

* [Leaflet.GeometryUtil](https://github.com/makinacorpus/Leaflet.GeometryUtil/)
* [Leaflet.AlmostOver](https://github.com/makinacorpus/Leaflet.AlmostOver/).
* [Leaflet.Snap](https://github.com/makinacorpus/Leaflet.Snap/).

Usage
-----

```javascript

    var map = L.map('map');
    ...
    var lines = L.geoJson(...);
    ...
    map.polylineGrab.addGuideLayer(lines);

```

And add default stylesheet ``leaflet.pathgrab.css`` for grab markers.

### Events ###

* **attach** (marker, layer) : fired when a grab is attached to a line.
* **detach** (marker) : fired when a grab is detached from a line.


TODO
----

* Moving a marker along a line should not detach it


Authors
-------

[![Makina Corpus](http://depot.makina-corpus.org/public/logo.gif)](http://makinacorpus.com)
