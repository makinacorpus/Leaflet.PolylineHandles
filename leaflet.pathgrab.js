L.Map.mergeOptions({
    polylineGrab: true
});


L.Handler.PolylineGrab = L.Handler.extend({

    includes: L.Mixin.Events,

    statics: {
        HOVER_DISTANCE: 30,   // pixels
        SAMPLING_PERIOD: 50,  // ms
    },

    initialize: function (map) {
        this._map = map;
        this._layers = [];
        this._previous = null;
        this._dragging = false;

        var grabIcon = L.divIcon({className: 'grab-icon'});
        this._marker = L.marker([0, 0], {icon: grabIcon});

        // Reduce 'mousemove' event trigger frequency
        this.__mouseMoveSampling = (function () {
            var timer = new Date();
            return function (e) {
                var date = new Date(),
                    filtered = (date - timer) < L.Handler.PolylineGrab.SAMPLING_PERIOD;
                if (this._dragging || filtered) {
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
        this.on('grab:off', this._onGrabOff, this);
    },

    removeHooks: function () {
        this.off('grab:on', this._onGrabOn, this);
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
        var snapfunc = L.GeometryUtil.closestLayerSnap,
            distance = L.Handler.PolylineGrab.HOVER_DISTANCE,
            closest = snapfunc(this._map, this._layers, e.latlng, distance, false);

        if (closest) {
            if (!this._previous) {
                this._marker.addTo(this._map);
                this.fire('grab:on', {layer: this});
            }
            this._marker.setLatLng(closest.latlng);
            this.fire('grab:move', {marker: this._marker,
                                    layer: this,
                                    latlng: e.latlng});
        }
        else {
            if (this._previous) {
                this.fire('grab:off', {layer: this});
                this._map.removeLayer(this._marker);
            }
        }
        this._previous = closest;
    },

    _onGrabOn: function (e) {
        this._marker.snapediting = new L.Handler.MarkerSnap(this._map);
        for (var i=0, n=this._layers.length; i<n; i++) {
            this._marker.snapediting.addGuideLayer(this._layers[i]);
        }

        this._marker.dragging = new L.Handler.MarkerDrag(this._marker);
        this._marker.dragging.enable();
        this._marker.on('dragstart', this._onDragStart, this);
        this._marker.on('dragend', this._onDragEnd, this);
    },

    _onGrabOff: function (e) {
        this._marker.off('dragstart', this._onDragStart, this);
        this._marker.off('dragend', this._onDragEnd, this);
        delete this._marker.snapediting;
    },

    _onDragStart: function (e) {
        this._marker.snapediting.watchMarker(this._marker);
        this._marker.snapediting.enable();
        this._dragging = true;
    },

    _onDragEnd: function (e) {
        this._dragging = false;
        this._marker.snapediting.unwatchMarker(this._marker);
        this._marker.snapediting.disable();
    }
});

L.Map.addInitHook('addHandler', 'polylineGrab', L.Handler.PolylineGrab);
