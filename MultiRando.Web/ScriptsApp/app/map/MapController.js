
/// <reference path="~/ScriptsApp/main.js" />
/// <reference path="~/scripts/google.map.js" />

(function (w, ko, _, $, Backbone, google, ep) {

    var vm = ep.vm;

    w.map = w.map || {};
    w.map.MapController = function (rootCtx, element, va, ava) {
        console.log("MapController loaded");

      
        var _this = this;
        _this.rootCtx = rootCtx;

        _.extend(_this, Backbone.Events);


        var viewModel = rootCtx.Map = {};
        _this.interestsCtrl = new map.InterestController(_this, viewModel);
        _this.segmentController = new map.SegmentController(_this, viewModel);
        _this.trackController = new map.TrackController(_this, viewModel);
        _this.routeController = new map.RouteController(_this, viewModel);
        _this.mediaController = new map.MediaPlayerController(_this, viewModel, $(element).find('#localMediaplayer')[0]);

        _this.CurrentPolylines = null;

        _this.currentTopPolylinesCallback = null;
        _this.setTopPolylines = function (p, callback) {
            if (callback) callback();
            p.setOptions({ zIndex: 99 });
            _this.currentTopPolylinesCallback = callback;
        }

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
            _this.segmentController.fetchSegments(nv);
            _this.interestsCtrl.fetchInterests(nv);
        });


        _this.parsePolyLines = w.map.MapController.parsePolyLines;

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

            
            polyline.setMap(_this.map);

            polyline.toCommandStr = function () {
                return _this.toCommandStr(polyline.getPath().getArray());
            }

            return polyline;
        }
        _this.toCommandStr = function(a) {
            return _.toArray(_.map(a, function (p) { return + p.lng() + ' ' + p.lat() ; })).join(',');
        }

        _this.cancelPolylines = function () {
            if (_this.CurrentPolylines) _this.CurrentPolylines.setMap(null);
            _this.CurrentPolylines = null;
        }

        _this.pointDistance = function (a, b) {
            return Math.sqrt(Math.pow(a.lat() - b.lat(), 2) + Math.pow(a.lng() - b.lng(), 2));
        };

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


            _this.map.mapTypes.set('carte', geoportailLayer("Carte IGN", 'mb3mp2757n4jqgzulticzcx2', "GEOGRAPHICALGRIDSYSTEMS.MAPS", { maxZoom: 18 }));

            _this.map.addListener('click', function (e) {
                var a = { canceled: false, latLng : e.latLng, lat: e.latLng.lat(), lng: e.latLng.lng() }
                _this.trigger("click.map", a);
                if(!a.canceled)_this.addPoint(e.latLng, false);
            });

            _this.map.addListener('rightclick', function (e) {
                var a = { canceled: false, latLng: e.latLng, lat: e.latLng.lat(), lng: e.latLng.lng() }
                _this.trigger("rightclick.map", a);
                if (!a.canceled) _this.addPoint(e.latLng, true);
            });

            _this.loadBound();

            _this.trigger("initialized.map", _this.map);
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
                position: latLng,
                maxWidth: 300,
                disableAutoPan : true,
                pixelOffset: new google.maps.Size(0,-20)
            });
            infowindow.open(_this.map);
        }
        _this.closeInfo = function () {
            if (infowindow) infowindow.close();
        }


        ep.messaging.read('MultiRando.Message.UserSettings.Queries.Get', {}, function (r) {
            var mapOptions = {
                center: { lat: parseFloat(r.MapCenterLat) || 46.3240998, lng: parseFloat(r.MapCenterLong) || 2.5689203 },
                zoom: parseFloat(r.MapZoom) || 15,
                mapTypeId: r.MapTypeId || google.maps.MapTypeId.SATELLITE,
                mapTypeControlOptions: { mapTypeIds: ['carte', google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.ROADMAP] },
            };
            _this.initMap(mapOptions);

            initActivity = r.Activity;
            viewModel.currentActivity(r.Activity);
        });


        viewModel.activityFlags = _.filter(ep.toKeyValues(w.ActivityFlags), function (v) { return v.key != 'Private'; });
    };

    function geoportailLayer(name, key, layer, options) {
        var l = new google.maps.ImageMapType
        ({
            getTileUrl: function (coord, zoom) {

                return "http://wxs.ign.fr/" + key + "/geoportail/wmts?service=WMTS" +
                    "&request=GetTile&version=1.0.0" +
                    "&tilematrixset=PM&tilematrix=" + zoom + 
                    "&tilecol=" + coord.x + "&tilerow=" + coord.y +
                    "&layer=GEOGRAPHICALGRIDSYSTEMS.PLANIGN" +
                    "&format=image/jpeg&style=normal";
            },
            tileSize: new google.maps.Size(256, 256),
            name: name,
            minZoom: (options.minZoom ? options.minZoom : 0),
            maxZoom: (options.maxZoom ? options.maxZoom : 18)
        });
        l.attribution = ' &copy; <a href="http://www.ign.fr/">IGN-France</a>';
        return l;
    };

    w.map.MapController.parsePolyLines = function (str) {
        var parts = str.substr('"LINESTRING '.length).replace(/\(/g, '').replace(/\)/g, '').split(',');
        var path = _.map(parts, function (p) {
            var ll = p.trim().split(' ');
            return new google.maps.LatLng(ll[1], ll[0]);
        });
        return path;
    }

    w.map.MapController.constants = {
        ColorSegmentIsPrivate: '#000',
        ColorSegmentNoWay: '#000',
        ColorSegmentRoad: '#9900ff',
        ColorSegmentEdit: '#33ccff',
        ColorSegmentWrongActivityFlag: '#000',
        ColorSegmentDefault: '#00FFFF',
        ColorTrackDefault: '#ffff66',
        StrokeWeightSegmentDefault: 3,
        StrokeWeightSegmentEdit: 3,
        StrokeWeightSegmentOver: 5
    };

    w.ActivityFlags = {
        Pedestrian: Math.pow(2, 1),
        Equestrian: Math.pow(2, 2),
        Quad: Math.pow(2, 3),
        Enduro: Math.pow(2, 4),
        Car: Math.pow(2, 5)
    }

}(window, window.ko, window._, window.$, window.Backbone, window.google, window.ep));