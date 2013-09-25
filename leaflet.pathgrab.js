L.Map.mergeOptions({
    polylineGrab: true
});


L.Handler.PolylineGrab = L.Handler.extend({

    includes: L.Mixin.Events,

    options: {
        overlapRadius: 15, // pixels
        markerFactory: null
    },

    initialize: function (map) {
        if (map.almostOver === undefined) {
            throw 'Leaflet.AlmostOver handler is required on this map.';
        }
        this._map = map;
        this._dragging = false;
        this._attached = [];
        this._marker = null;
        this._snap = null;
        this._layers = [];
    },

    addHooks: function () {
        this._toggleAlmostEvent(true);
        this.on('attach', this._onAttach, this);
        this.on('detach', this._onDetach, this);
    },

    removeHooks: function () {
        this.off('attach', this._onAttach, this);
        this.off('detach', this._onDetach, this);
        this._toggleAlmostEvent(false);
    },

    addGuideLayer: function (l) {
        this._layers.push(l);
    },

    _toggleAlmostEvent: function (state) {
        var method = state ? 'on' : 'off';
        this._map[method]('almost:over', this._onAlmostOver, this);
        this._map[method]('almost:move', this._onAlmostMove, this);
        this._map[method]('almost:out', this._onAlmostOut, this);
    },

    _onAttach: function (e) {
        this._attached.push(e.marker);
    },

    _onDetach: function (e) {
        var idx = this._attached.indexOf(e.marker);
        this._attached.splice(idx, 1);
    },

    _onAlmostOver: function (e) {
        if (this.options.markerFactory) {
            this._marker = this.options.markerFactory(e.latlng);
        }
        else {
            var grabIcon = L.divIcon({className: 'grab-icon'});
            this._marker = L.marker(e.latlng, {icon: grabIcon});
        }
        this._marker.attached = false;
        this._marker.on('dragstart', this._onDragStart, this);
        this._marker.on('dragend', this._onDragEnd, this);
        this._marker.on('click', this._onClick, this);
    },

    _onAlmostMove: function (e) {
        // Hide current marker when approaching the ones already attached.
        for (var i=0, n=this._attached.length; i<n; i++) {
            var attached = this._attached[i],
                space = L.GeometryUtil.distance(this._map,
                                                attached.getLatLng(),
                                                e.latlng);
            if (space < this.options.overlapRadius) {
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

    _onAlmostOut: function (e) {
        this._marker.off('dragstart', this._onDragStart, this);
        this._marker.off('dragend', this._onDragEnd, this);
        this._marker.off('click', this._onClick, this);
        this._map.removeLayer(this._marker);
        this._marker = null;
    },

    // When marker starts dragging :
    //  - initialize snapping
    //  - ignore map mouse moves
    _onDragStart: function (e) {
        this._toggleAlmostEvent(false);

        var marker = e.target;
        marker.snapediting = new L.Handler.MarkerSnap(this._map, marker, {snapVertices: false});
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

        if (this._snap && !marker.attached) {
            marker.attached = true;
            this.fire('attach', {marker: marker, layer: this._snap});
            L.DomUtil.addClass(marker._icon, 'marker-attached');
            // Start over
            this._onAlmostOver({latlng: marker.getLatLng()});
        }
        else {
            if (marker.attached) {
                marker.attached = false;
                this.fire('detach', {marker: marker});
                L.DomUtil.removeClass(marker._icon, 'marker-attached');
                // Remove from map
                this._map.removeLayer(marker);
            }
        }
        this._toggleAlmostEvent(true);
    },

    _onClick: function (e) {
        var marker = e.target;
        this._onDragStart(e);
        marker.fire('move');
        this._onDragEnd(e);
    },
});

L.Map.addInitHook('addHandler', 'polylineGrab', L.Handler.PolylineGrab);
