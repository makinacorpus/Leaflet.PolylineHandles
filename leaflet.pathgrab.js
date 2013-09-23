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

        var grabIcon = L.divIcon({className: 'grab-icon'});
        this._marker = L.marker([0, 0], {icon: grabIcon});

        // Reduce 'mousemove' event trigger frequency
        this.__mouseMoveSampling = (function () {
            var timer = new Date();
            return function (e) {
                var date = new Date();
                if ((date - timer) < L.Handler.PolylineGrab.SAMPLING_PERIOD) {
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
    },

    removeHooks: function () {
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
                this.fire('grab:on', {layer: this});
            }
            this._marker.setLatLng(closest.latlng).addTo(this._map);
            this.fire('grab:move', {layer: this, latlng: e.latlng});
        }
        else {
            this._map.removeLayer(this._marker);
            if (this._previous) {
                this.fire('grab:off', {layer: this});
            }
        }
        this._previous = closest;
    }
});

L.Map.addInitHook('addHandler', 'polylineGrab', L.Handler.PolylineGrab);
