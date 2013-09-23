Leaflet.PathGrab
================

This plugin allows to grab intermediary points on a polyline.

The same way you choose intermediary steps on route maps.

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

* ** attach ** (marker, layer) : fired when a grab is attached to a line.
* ** detach ** (marker) : fired when a grab is detached from a line.

Additionally, events dedicated to grab markers:

* ** grab:on ** (latlng) : fired when mouse is close to the line.
* ** grab:move ** (latlng) : fired when mouse is moved.
* ** grab:off ** : fired when mouse is far.


Authors
-------

[![Makina Corpus](http://depot.makina-corpus.org/public/logo.gif)](http://makinacorpus.com)
