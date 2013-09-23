L.Map.mergeOptions({
    polylineGrab: true
});


L.Handler.PolylineGrab = L.Handler.extend({

    includes: L.Mixin.Events,

    statics: {
        HOVER_DISTANCE: 45,   // pixels
        SAMPLING_PERIOD: 50,  // ms
    },

    initialize: function (map) {
        this._map = map;
        this._layers = [];
        this._previous = null;
        this._dragging = false;

        this._marker = null;

        // Reduce 'mousemove' event trigger frequency
        this.__mouseMoveSampling = (function () {
            var timer = new Date();
            return function (e) {
                var date = new Date(),
                    filtered = (date - timer) < L.Handler.PolylineGrab.SAMPLING_PERIOD;
                if (filtered) {
                    return;  // Ignore movement
                }
                timer = date;
                this._map.fire('mousemovesample', {latlng: e.latlng});
            };
        })();
    },

    addHooks: function () {
        this._map.on('mousemove', this.__mouseMoveSampling, this);
        this._map.on('mousemovesample', this._onMouseMove, this);
        this.on('grab:on', this._onGrabOn, this);
        this.on('grab:move', this._onGrabMove, this);
        this.on('grab:off', this._onGrabOff, this);
    },

    removeHooks: function () {
        this.off('grab:on', this._onGrabOn, this);
        this.off('grab:move', this._onGrabMove, this);
        this.off('grab:off', this._onGrabOff, this);
        this._map.off('mousemovesample');
        this._map.off('mousemove', this.__mouseMoveSampling, this);
    },

    addLayer: function (layer) {
        if (typeof layer.eachLayer == 'function') {
            layer.eachLayer(function (l) {
                this.addLayer(l);
            }, this);
        }
        else {
            this._layers.push(layer);
        }
    },

    _onMouseMove: function (e) {
        if (this._dragging)
            return;

        var snapfunc = L.GeometryUtil.closestLayerSnap,
            distance = L.Handler.PolylineGrab.HOVER_DISTANCE,
            closest = snapfunc(this._map, this._layers, e.latlng, distance, false);

        if (closest) {
            if (!this._previous) {
                this.fire('grab:on', {latlng: closest.latlng});
            }
            this.fire('grab:move', {latlng: closest.latlng});
        }
        else {
            if (this._previous) {
                this.fire('grab:off');
            }
        }
        this._previous = closest;
    },

    _onGrabOn: function (e) {
        var grabIcon = L.divIcon({className: 'grab-icon'});
        this._marker = L.marker(e.latlng, {icon: grabIcon});
        this._marker.addTo(this._map);

        this._marker.dragging = new L.Handler.MarkerDrag(this._marker);
        this._marker.dragging.enable();
        this._marker.on('dragstart', this._onDragStart, this);
        this._marker.on('dragend', this._onDragEnd, this);
    },

    _onGrabMove: function (e) {
        this._marker.setLatLng(e.latlng);
    },

    _onGrabOff: function (e) {
        this._marker.off('dragstart', this._onDragStart, this);
        this._marker.off('dragend', this._onDragEnd, this);
        this._map.removeLayer(this._marker);
        this._marker = null;
    },

    _onDragStart: function (e) {
        this._dragging = true;

        var marker = e.target;
        marker.snapediting = new L.Handler.MarkerSnap(this._map, marker);
        for (var i=0, n=this._layers.length; i<n; i++) {
            marker.snapediting.addGuideLayer(this._layers[i]);
        }
        marker.on('snap', this._onSnap, this);
        marker.on('unsnap', this._onUnsnap, this);
    },

    _onDragEnd: function (e) {
        var marker = e.target;
        marker.snapediting.disable();
        marker.off('snap', this._onSnap, this);
        marker.off('unsnap', this._onUnsnap, this);

        if (this._snap) {
            this.fire('attach', {marker: marker, layer: this._snap});
            // Start over
            this._onGrabOn({latlng: marker.getLatLng()});
        }
        else {
            if (marker !== this._marker) {
                this.fire('detach', {marker: marker});
                // Remove from map
                this._map.removeLayer(marker);
            }
        }

        this._dragging = false;
    },

    _onSnap: function (e) {
        this._snap = e.layer;
    },

    _onUnsnap: function (e) {
        this._snap = null;
    }
});

L.Map.addInitHook('addHandler', 'polylineGrab', L.Handler.PolylineGrab);
