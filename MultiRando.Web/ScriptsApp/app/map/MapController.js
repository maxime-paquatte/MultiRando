
/// <reference path="~/ScriptsApp/main.js" />
/// <reference path="~/scripts/google.map.js" />

(function (w, ko, _, $, Backbone, google, ep) {

    w.map = w.auth || {};
    w.map.MapController = function (rootCtx, element, va, ava) {
        console.log("MapController loaded");

      
        var _this = this;
        _this.rootCtx = rootCtx;

        _.extend(_this, Backbone.Events);


        var viewModel = rootCtx.Map = {};
        _this.interestsCtrl = new map.InterestController(_this, viewModel);
        _this.segmentController = new map.SegmentController(_this, viewModel);

        _this.CurrentPolylines = null;

        var initActivity = 0;
        viewModel.currentActivity = ko.observable();
        viewModel.currentActivity.subscribe(function(nv) {
            _this.trigger("changed.currentActivity.map", { activity: nv });
            if (nv != initActivity)
                ep.messaging.send('MultiRando.Message.UserSettings.Commands.SetActivity', { Activity: nv }, {});
        });

        viewModel.pageHeight = ko.observable($(w).height());
        $(w).resize(function () { viewModel.pageHeight($(w).height()); });


        viewModel.mapCenter = ko.observable({}).extend({ rateLimit: { timeout: 5000, method: "notifyWhenChangesStop" } });
        viewModel.mapCenter.subscribe(function (nv) {
            ep.messaging.send('MultiRando.Message.UserSettings.Commands.SetMap', nv, {
            });
        });


        viewModel.bound = _this.bound =  ko.observable({}).extend({ rateLimit: { timeout: 1000, method: "notifyWhenChangesStop" } });
        viewModel.bound.subscribe(function (nv) {
            _this.interestsCtrl.fetchInterests(nv);
            _this.segmentController.fetchSegments(nv);
        });



        _this.parsePolyLines = function (str) {
            var parts = str.substr('"MULTIPOINT '.length).replace(/\(/g, '').replace(/\)/g, '').split(',');
            var path = _.map(parts, function (p) {
                var ll = p.trim().split(' ');
                return new google.maps.LatLng(ll[1], ll[0]);
            });
            return path;
        }
        _this.loadPolyline = function (path, options) {

            var settings = _.defaults(options, {
                path: path,
                geodesic: true,
                strokeColor: w.map.MapController.constants.ColorSegmentDefault,
                strokeWeight: w.map.MapController.constants.StrokeWeightSegmentDefault,
                strokeOpacity: 1.0,
                editable: false
            });

            var polyline = new google.maps.Polyline(settings);

            polyline.addListener('dblclick', function (e) {
                var p = polyline.getPath();
                p.removeAt(e.vertex);
                polyline.setPath(p);
            });

            polyline.setMap(_this.map);

            polyline.toCommandStr = function () {
                return _this.toCommandStr(polyline.getPath().getArray());
            }

            return polyline;
        }
        _this.toCommandStr = function(a) {
            return _.toArray(_.map(a, function (p) { return '(' + p.lng() + ' ' + p.lat() + ')'; })).join(',');
        }

        _this.cancelPolylines = function () {
            if (_this.CurrentPolylines) _this.CurrentPolylines.setMap(null);
            _this.CurrentPolylines = null;
        }

        _this.changeMapPos = function () {
            var c = _this.map.getCenter();
            viewModel.mapCenter({
                Lat: c.lat(), Long: c.lng(),
                Zoom: _this.map.getZoom(),
                MapTypeId: _this.map.getMapTypeId()
            });

            _this.loadBound();
        }

        _this.loadBound = function () {
            var b = _this.map.getBounds();
            if (b) {
                var n = _this.map.getBounds().getNorthEast(),
                    s = _this.map.getBounds().getSouthWest();
                viewModel.bound({
                    NorthEastLat: n.lat(),
                    NorthEastLng: n.lng(),
                    SouthWestLat: s.lat(),
                    SouthWestLng: s.lng()
                });
            } else setTimeout(_this.loadBound, 500);
        }

        _this.initMap = function (mapOptions) {

            _this.map = new google.maps.Map(w.document.getElementById('map-canvas'), mapOptions);
            _this.map.addListener('center_changed', _this.changeMapPos);
            _this.map.addListener('zoom_changed', _this.changeMapPos);
            _this.map.addListener('maptypeid_changed', _this.changeMapPos);

            _this.map.addListener('click', function (e) {
                _this.addPoint(e.latLng, false);
            });

            _this.map.addListener('rightclick', function (e) {
                _this.addPoint(e.latLng, true);
            });

            _this.loadBound();
        }

        _this.addPoint = function (latLng, atFirst) {

            if (_this.CurrentPolylines) {
                var p = _this.CurrentPolylines.getPath();
                if (atFirst) p.insertAt(0, latLng);
                else p.push(latLng);
                _this.CurrentPolylines.setPath(p);
            } 
        }

        var infowindow = null;
        _this.showInfo = function (contentString, latLng) {
            infowindow = new google.maps.InfoWindow({
                content: contentString,
                position: latLng
            });
            infowindow.open(_this.map);
        }
        _this.closeInfo = function () {
            if (infowindow) infowindow.close();
        }

        ep.messaging.read('MultiRando.Message.UserSettings.Queries.Get', {}, function (r) {
            var mapOptions = { center: { lat: parseFloat(r.MapCenterLat) || 46.3240998, lng: parseFloat(r.MapCenterLong) || 2.5689203 }, zoom: parseFloat(r.MapZoom) || 15, mapTypeId: r.MapTypeId || google.maps.MapTypeId.SATELLITE };
            _this.initMap(mapOptions);
            initActivity = r.Activity;
            viewModel.currentActivity(r.Activity);
        });


        viewModel.activityFlags = _.filter(ep.toKeyValues(w.ActivityFlags), function (v) { return v.key != 'Private'; });
    };

    w.map.MapController.constants = {
        ColorSegmentRoad: '#9900ff',
        ColorSegmentEdit: '#33ccff',
        ColorSegmentWrongActivityFlag: '#000',
        ColorSegmentDefault: '#00FFFF',
        StrokeWeightSegmentDefault: 3,
        StrokeWeightSegmentEdit: 3,
        StrokeWeightSegmentOver: 4
    };

    w.ActivityFlags = {
        Pedestrian: Math.pow(2, 1),
        Equestrian: Math.pow(2, 2),
        Quad: Math.pow(2, 3),
        Enduro: Math.pow(2, 4),
        Car: Math.pow(2, 5),
        Private: Math.pow(2, 30)
    }

}(window, window.ko, window._, window.$, window.Backbone, window.google, window.ep));