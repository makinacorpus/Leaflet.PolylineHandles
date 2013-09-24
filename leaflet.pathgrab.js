L.Map.mergeOptions({
    polylineGrab: true
});


L.Handler.PolylineGrab = L.Handler.extend({

    includes: L.Mixin.Events,

    statics: {
        HOVER_DISTANCE: 25,   // pixels
        SAMPLING_PERIOD: 50,  // ms
        COLLAPSE_DISTANCE: 15, // pixels
    },

    initialize: function (map) {
        this._map = map;
        this._layers = [];
        this._previous = null;
        this._dragging = false;
        this._attached = [];
        this._marker = null;

        // Reduce 'mousemove' event frequency
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
        this.on('grab:over', this._onGrabOn, this);
        this.on('grab:move', this._onGrabMove, this);
        this.on('grab:out', this._onGrabOff, this);
        this.on('attach', this._onAttach, this);
        this.on('detach', this._onDetach, this);
    },

    removeHooks: function () {
        this.off('attach', this._onAttach, this);
        this.off('detach', this._onDetach, this);
        this.off('grab:over', this._onGrabOn, this);
        this.off('grab:move', this._onGrabMove, this);
        this.off('grab:out', this._onGrabOff, this);
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
                this.fire('grab:over', {layer: closest.layer,
                                        latlng: closest.latlng});
            }
            this.fire('grab:move', {layer: closest.layer,
                                    latlng: closest.latlng});
        }
        else {
            if (this._previous) {
                this.fire('grab:out');
            }
        }
        this._previous = closest;
    },

    _onAttach: function (e) {
        this._attached.push(e.marker);
    },

    _onDetach: function (e) {
        var idx = this._attached.indexOf(e.marker);
        this._attached.splice(idx, 1);
    },

    _onGrabOn: function (e) {
        var grabIcon = L.divIcon({className: 'grab-icon'});
        this._marker = L.marker(e.latlng, {icon: grabIcon});
        this._marker.on('dragstart', this._onDragStart, this);
        this._marker.on('dragend', this._onDragEnd, this);
    },

    _onGrabMove: function (e) {
        // Hide current marker when approaching the ones already attached.
        for (var i=0, n=this._attached.length; i<n; i++) {
            var attached = this._attached[i],
                space = L.GeometryUtil.distance(this._map,
                                                attached.getLatLng(),
                                                e.latlng);
            if (space < L.Handler.PolylineGrab.COLLAPSE_DISTANCE) {
                this._map.removeLayer(this._marker);
                return;
            }
        }
        // No attached marker around
        if (i == n) {
            this._map.addLayer(this._marker);
            this._marker.dragging = new L.Handler.MarkerDrag(this._marker);
            this._marker.dragging.enable();
        }
        this._marker.setLatLng(e.latlng);
    },

    _onGrabOff: function (e) {
        this._marker.off('dragstart', this._onDragStart, this);
        this._marker.off('dragend', this._onDragEnd, this);
        this._map.removeLayer(this._marker);
        this._marker = null;
    },

    // When marker starts dragging :
    //  - initialize snapping
    //  - ignore map mouse moves
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

    _onSnap: function (e) {
        this._snap = e.layer;
    },

    _onUnsnap: function (e) {
        this._snap = null;
    },

    // When marker dragging stops :
    //  - 'attach' and start again if marker was snapped
    //  - 'detach' if marker was previously attached
    _onDragEnd: function (e) {
        var marker = e.target;
        marker.snapediting.disable();
        marker.off('snap', this._onSnap, this);
        marker.off('unsnap', this._onUnsnap, this);

        if (this._snap) {
            this.fire('attach', {marker: marker, layer: this._snap});
            L.DomUtil.addClass(marker._icon, 'marker-attached');
            // Start over
            this._onGrabOn({latlng: marker.getLatLng()});
        }
        else {
            if (marker !== this._marker) {
                this.fire('detach', {marker: marker});
                L.DomUtil.removeClass(marker._icon, 'marker-attached');
                // Remove from map
                this._map.removeLayer(marker);
            }
        }
        this._dragging = false;
    }
});

L.Map.addInitHook('addHandler', 'polylineGrab', L.Handler.PolylineGrab);
