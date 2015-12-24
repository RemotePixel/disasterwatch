L.Mask = L.Rectangle.extend({
	options: {
		stroke: false,
		color: '#333',
		fillOpacity: 0.5,
		clickable: true,

		outerBounds: new L.LatLngBounds([-90, -360], [90, 360])
	},

	initialize: function (latLngBounds, options) {
		L.Polygon.prototype.initialize.call(this, [this._boundsToLatLngs(this.options.outerBounds), this._boundsToLatLngs(latLngBounds)], options);				
	},

	getLatLngs: function () {
		return this._holes[0];
	},

	setLatLngs: function (latlngs) {
		this._holes[0] = this._convertLatLngs(latlngs);
		return this.redraw();
	},

	setBounds: function (latLngBounds) {
		this._holes[0] = this._boundsToLatLngs(latLngBounds);
		return this.redraw();
	}

});

L.mask = function (latLngBounds, options) {
	return new L.Mask(latLngBounds, options);
};


if (L.Draw && L.Draw.SimpleShape) {

	L.Draw.Mask = L.Draw.SimpleShape.extend({
		statics: {
			TYPE: 'mask'
		},

		options: {
			shapeOptions: {
				stroke: false,
				color: '#333',
				fillOpacity: 0.5,
				clickable: true
			}
		},

		initialize: function (map, options) {
			this.type = L.Draw.Mask.TYPE;
			this._initialLabelText = 'Click and drag to draw mask';
			L.Draw.SimpleShape.prototype.initialize.call(this, map, options);
		},

		_drawShape: function (latlng) {
			if (!this._shape) {
				this._shape = new L.Mask(new L.LatLngBounds(this._startLatLng, latlng), this.options.shapeOptions);
				this._map.addLayer(this._shape);
			} else {
				this._shape.setBounds(new L.LatLngBounds(this._startLatLng, latlng));
			}
		},

		_fireCreatedEvent: function () {
			var mask = new L.Mask(this._shape.getBounds(), this.options.shapeOptions);
			L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, mask);
		}
	});

}

