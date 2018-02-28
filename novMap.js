var NovMap = function (element, mapOptions, callback) {
    var self = this;

    self.map = null;
    self.markers = [];
    self.infoBoxes = [];
    self.geocoder = new google.maps.Geocoder();
    self.center = null;
    self.callbacks = {};

    var onWindowLoad = function () {
        // var mapElement = document.querySelector( element );

        if (!element) throw new Error('Invalid DOM element provided for map. Could not find provided map container.');

        self.map = new google.maps.Map(element, mapOptions);

        if (mapOptions.center) {
            self.center = mapOptions.center;
        }

        google.maps.event.addListener(self.map, 'resize', function () {
            self.showAllMarkers.apply(self);
        });

        callback();
    };

    google.maps.event.addDomListener(window, 'load', onWindowLoad);
};

NovMap.prototype.addMapEvent = function (event, callback) {
    var rand = utils.random();

    this.callbacks[rand] = google.maps.event.addListener(this.map, event, callback);

    return rand;
}

/*
 *
 */
NovMap.prototype.addMarkerAt = function (latitude, longitude, title, icon, data, clickCallback, mouseOverCallback, mouseOutCallback) {

    if (typeof latitude === 'undefined' ||
        typeof longitude === 'undefined') {
        throw new Error('latitude and longitude are required');
    }

    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(latitude, longitude),
        map: this.map,
        title: title || '',
        optimized: false
    });

    if (typeof icon !== 'undefined') {
        marker.setIcon(icon);
    }

    if (typeof clickCallback !== 'undefined') {
        marker.addListener('click', function () {
            clickCallback.apply(marker);
        });
    }

    if (typeof mouseOverCallback !== 'undefined') {
        marker.addListener('mouseover', function () {
            mouseOverCallback.apply(marker);
        });
    }

    if (typeof mouseOutCallback !== 'undefined') {
        marker.addListener('mouseout', function () {
            mouseOutCallback.apply(marker);
        });
    }

    if (typeof data !== 'undefined') {
        marker.data = data;
    }

    marker.optimized = false;

    this.markers.push(marker);

    return marker;
};

/*
 * @property {string} [url=undefined] An image depicting the marker
 * @width {int} [width=undefined] The width of the image
 */
NovMap.prototype.generateIcon = function (url, width, height, anchorX, anchorY, offsetX, offsetY, scaledWidth, scaledHeight) {

    anchorX = anchorX || 0;
    anchorY = anchorY || 0;
    offsetX = offsetX || 0;
    offsetY = offsetY || 0;
    scaledWidth = scaledWidth || width;
    scaledHeight = scaledHeight || height;

    return {
        url: url,
        size: new google.maps.Size(width, height),
        origin: new google.maps.Point(offsetX, offsetY),
        anchor: new google.maps.Point(anchorX, anchorY),
        scaledSize: new google.maps.Size(scaledWidth, scaledHeight)
    };

};

/*
 *
 */
NovMap.prototype.getLatLngForAddress = function (address, callback) {

    if (typeof address === 'undefined' ||
        address.length === 0) {
        throw new Error('address is required');
    }

    this.geocoder.geocode({
        'address': address
    }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results.length === 0) {
                throw new Exception('No Latitude and Longitude found for given address')
            } else {
                callback(results);
            }
        } else {
            throw new Error(status);
        }
    });

};

/*
 *
 */
NovMap.prototype.setCenterAt = function (latitude, longitude) {
    if (typeof latitude === 'undefined' ||
        typeof longitude === 'undefined') {
        throw new Error('latitude and longitude are required');
    }

    var center = new google.maps.LatLng(latitude, longitude);

    this.center = center;

    this.map.setCenter(center);
};

/*
 *
 */
NovMap.prototype.createInfoBox = function (content, marker, opts) {

    if (typeof SnazzyInfoWindow === 'undefined')
        return console.error('In order to create infoBoxes you need to include the SnazzyInfoWindow class');

    var infoBox = new SnazzyInfoWindow({
        marker: marker,
        content: content,
        maxWidth: 310,
        maxHeight: 500,
        offset: {
            left: '4px'
        }
    });

    this.infoBoxes.push(infoBox);

    return infoBox;
}

/*
 *
 */
NovMap.prototype.getURLForLatLng = function (latitude, longitude) {
    return "http://maps.google.com/?ll=" + latitude + ',' + longitude;
};

/*
 *
 */
NovMap.prototype.getMarkers = function () {
    return this.markers;
};

/*
 *
 */
NovMap.prototype.getMap = function () {
    return this.map;
};

NovMap.prototype.getInfoBoxes = function () {
    return this.infoBoxes;
}

NovMap.prototype.showAllMarkers = function () {
    var bounds = new google.maps.LatLngBounds();

    if (this.getMarkers().length == 0) return;

    for (i = 0; i < this.getMarkers().length; i++) {
        bounds.extend(this.getMarkers()[i].getPosition());
    }

    this.setBounds(bounds);
}

NovMap.prototype.removeAllMarkers = function () {
    this.markers.forEach(function (m) {
        m.setMap(null);
    });
}

NovMap.prototype.setBounds = function (bounds) {
    this.getMap().fitBounds(bounds);
    this.getMap().setCenter(bounds.getCenter());
}


NovMap.prototype.getCenter = function () {
    return this.getMap().getCenter();
}

NovMap.prototype.setCenter = function (latLng, animated) {
    if (animated)
        this.getMap().panTo(latLng);
    else
        this.getMap().setCenter(latLng);
}