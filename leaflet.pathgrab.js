var PolylineGrab = {

    statics: {
        HOVER_DISTANCE: 30,   // pixels
        SAMPLING_PERIOD: 50,  // ms
    },

    __onAdd: L.Polyline.prototype.onAdd,
    __onRemove: L.Polyline.prototype.onRemove,

    onAdd: function (map) {
        this.__onAdd.call(this, map);
        if (true || this.options.enableGrab) {
            this.enableGrab();
        }

        this.__mouseMoveSampling = (function () {
            var timer = new Date();
            return function (e) {
                var date = new Date();
                if ((date - timer) < PolylineGrab.statics.SAMPLING_PERIOD) {
                    return;  // Ignore movement
                }
                timer = date;
                this._map.fire('mousemovesample', {latlng: e.latlng});
            };
        })();
        this._map.on('mousemove', this.__mouseMoveSampling, this);
    },

    onRemove: function (map) {
        this.disableGrab();
        this._map.off('mousemove', this.__mouseMoveSampling, this);
        this.__onRemove.call(this, map);
    },

    enableGrab: function () {
        if (this._map.__grabMarker === undefined) {
            var grabIcon = L.divIcon({className: 'grab-icon'});
            this._map.__grabMarker = L.marker([0, 0], {icon: grabIcon});
        }

        this._map.on('mousemovesample', this.__onMouseMove, this);
    },

    disableGrab: function () {
        this._map.off('mousemovesample');
    },

    __onMouseMove: function (e) {
        var snapfunc = L.GeometryUtil.closestLayerSnap,
            distance = PolylineGrab.statics.HOVER_DISTANCE,
            closest = snapfunc(this._map, [this], e.latlng, distance, false);
        if (closest) {
            this._map.__grabMarker.setLatLng(closest.latlng).addTo(this._map);
        }
        else {
            this._map.removeLayer(this._map.__grabMarker);
        }
    }
};

L.Polyline.include(PolylineGrab);
