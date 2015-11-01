﻿
/// <reference path="~/ScriptsApp/main.js" />
/// <reference path="~/scripts/google.map.js" />

(function (w, ko, _, $, google, ep) {

    w.map = w.auth || {};
    w.map.MapController = function (viewModel, element, va, ava) {
        var _this = this;
        var rootCtx = viewModel;
        viewModel = viewModel.Map = {};
        _this.CurrentPolylines = null;

        viewModel.currentActivity = ko.observable();

        viewModel.pageHeight = ko.observable($(w).height());
        $(w).resize(function () {
            viewModel.pageHeight($(w).height());
        });


        viewModel.mapCenter = ko.observable({}).extend({ rateLimit: { timeout: 5000, method: "notifyWhenChangesStop" } });
        viewModel.mapCenter.subscribe(function (nv) {
            ep.messaging.send('MultiRando.Message.MapSettings.Commands.Set', nv, {
            });
        });


        viewModel.bound = ko.observable({}).extend({ rateLimit: { timeout: 1000, method: "notifyWhenChangesStop" } });
        viewModel.bound.subscribe(function (nv) {
            _this.loadSegments(nv);
        });


        _this.segments = [];
        _this.loadSegments = function (bounds) {
            ep.messaging.read('MultiRando.Message.Segment.Queries.GetInBound', bounds, function (r) {

                _this.clearSegments();
                if (_.isArray(r)) {
                    for (var i = 0; i < r.length; i++) {
                        var segment = ko.mapping.fromJS(r[i], { 'copy': ["Polylines"] });
                        segment.ActivityFlag.extend({ bitFlag: {} });
                        var e = viewModel.editedSegment();
                        if (!e || e.SegmentId != segment.SegmentId)
                            _this.loadSegment(segment);
                    }
                }
            });
        }
        _this.loadSegment = function (segment) {
            var path = segment.Polylines ? _this.parsePolyLines(segment.Polylines) : [];

            var color = segment.ActivityFlag.hasFlag(ActivityFlags.Private) || segment.ActivityFlag.hasFlag(ActivityFlags[viewModel.currentActivity()]) ?
                '#FF0000' : '#FFCC00';
            var polylines = _this.loadPolyline(path, { strokeColor: color });

            segment.polylines = polylines;
            _this.segments.push(segment);

            if (segment.SegmentId) {
                var iw = null;
                polylines.addListener('mouseover', function () {
                    var e = viewModel.editedSegment();
                    if (!e || e.SegmentId != segment.SegmentId) {
                        polylines.setOptions({ strokeWeight: 5 });

                        if (iw) iw.close();
                        var center = path[0];
                        iw = new google.maps.InfoWindow({
                            position: center,
                            content: ko.renderTemplateX('segment-details', segment, rootCtx)
                        });
                        iw.open(_this.map);
                    }
                });
                polylines.addListener('mouseout', function () {
                    if (iw) iw.close();

                    polylines.setOptions({ strokeWeight: 2 });
                });

                polylines.addListener('click', function () {
                    viewModel.editSegment(segment);
                });
            }


            return segment;
        }
        _this.clearSegments = function () {
            var e = viewModel.editedSegment();

            for (var i = 0; i < _this.segments.length; i++) {
                var segment = _this.segments[i];
                if (!e || e.SegmentId != segment.SegmentId) {

                    segment.polylines.setMap(null);
                    google.maps.event.clearInstanceListeners(segment.polylines);
                }
            }
            _this.segments = [];
        }


        viewModel.editedSegment = ko.observable(null);

        viewModel.addSegment = function () {
            var s = _this.loadSegment({ SegmentId: 0 });
            viewModel.editSegment(s);
        }
        viewModel.editSegment = function (s) {

            viewModel.editedSegment(s);
            s.polylines.setEditable(true);
        }
        viewModel.cancelSegment = function () {
            var s = viewModel.editedSegment();
            s.polylines.setMap(null);


            viewModel.editedSegment(null);
            _this.loadBound();
        }
        viewModel.saveSegment = function () {
            var data = ko.mapping.toJS(viewModel.editedSegment);
            data.Polylines = viewModel.editedSegment().polylines.toCommandStr();

            ep.messaging.send('MultiRando.Message.Segment.Commands.UpdateOrCreate', data, {
                'MultiRando.Message.Segment.Events.Changed': function (r) {
                    viewModel.cancelSegment();
                    ep.stdSuccessCallback();
                }
            });

        }



        viewModel.routes = ko.observableArray();
        _this.fetchRoutes = function () {
            return ep.messaging.read('MultiRando.Message.Route.Queries.GetPage', { Skip: 0, Take: 10, Total: -1 }, function (r) {
                var routes = _.map(r.items, function (i) {
                    return ko.mapping.fromJS(i, {
                        'IsPublic': { create: function (options) { return ko.observable(parseInt(options.data)); } }
                    });
                });
                viewModel.routes(routes);
            });
        }
        _this.fetchRoutes();


        viewModel.selectedRoute = ko.observable();
        viewModel.selectedRoute.subscribe(function (nv) {
            if (nv) {
                ep.messaging.read('MultiRando.Message.Route.Queries.GetPolyline', { RouteId: nv.RouteId }, function (r) {
                    if (r.Polylines) {
                        var path = _this.parsePolyLines(r.Polylines);
                        _this.CurrentPolylines = _this.loadPolyline(path, { editable: false, strokeColor: '#00FFFF' });
                    } else {
                        _this.CurrentPolylines = _this.loadPolyline([], { editable: false });
                    }
                });
            } else {
                _this.cancelPolylines();
            }
        });

        viewModel.addRoute = function () {
            w.alertify.prompt(ep.res('Res.Page.Map.PromptRouteName'), '', function (ok, str) {
                if (ok) {
                    ep.messaging.send('MultiRando.Message.Route.Commands.Create', { Name: str }, {
                        'MultiRando.Message.Route.Events.Created': function (r) {
                            _this.fetchRoutes().then(function () {
                                var s = _.find(viewModel.routes(), function (a) {
                                    return a.RouteId == r.routeId;
                                });
                                viewModel.selectedRoute(s);
                            });
                        }
                    });
                }
            });
        }
        viewModel.selectRoute = function (r) {
            viewModel.selectedRoute(r);
        }
        viewModel.cancelRoute = function (r) {
            viewModel.selectedRoute(null);
        }
        viewModel.saveRoute = function (d) {
            ep.messaging.send('MultiRando.Message.Route.Commands.Update', { RouteId: d.RouteId, Name: d.Name, Comment: d.Comment, IsPublic: d.IsPublic ? true: false }, {
                'MultiRando.Message.Route.Events.Changed': function(r) {
                    ep.stdSuccessCallback();
                    viewModel.selectedRoute(null);
                }
            });
        }

        viewModel.isRoutePolylinesEdit = ko.observable(false);
        viewModel.isRoutePolylinesEdit.subscribe(function (nv) {
            _this.CurrentPolylines.setEditable(nv);
        });
        viewModel.cancelRoutePolylines = function () {
            viewModel.isRoutePolylinesEdit(false);
        }
        viewModel.editRoutePolylines = function (d) {
            viewModel.isRoutePolylinesEdit(true);
        };
        viewModel.saveRoutePolylines = function (r) {
            var str = _this.CurrentPolylines.toCommandStr();

            var pathLength = google.maps.geometry.spherical.computeLength(_this.CurrentPolylines.getPath()) / 1000;
            ep.messaging.send('MultiRando.Message.Route.Commands.SetPolyline', { RouteId: viewModel.selectedRoute().RouteId, Polylines: str, PathLength: parseInt(pathLength) }, {
                'MultiRando.Message.Route.Events.Changed': function () {
                    ep.stdSuccessCallback();
                    viewModel.isRoutePolylinesEdit(false);
                }
            });
        }

        viewModel.deleteRoute = function (r) {
            w.alertify.confirm(ep.res('Res.Std.ConfirmDelete'), function () {
                ep.messaging.send('MultiRando.Message.Route.Commands.Delete', { RouteId: viewModel.selectedRoute().RouteId }, {
                    'MultiRando.Message.Route.Events.Deleted': function (e) {
                        viewModel.selectedRoute(null);
                        _this.fetchRoutes().then(ep.stdSuccessCallback);
                    }
                });
            });
        }

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
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2,
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
                return _.toArray(_.map(polyline.getPath().getArray(), function (p) { return '(' + p.lng() + ' ' + p.lat() + ')'; })).join(',');
            }

            return polyline;
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
                p.insertAt(0, latLng);
                _this.CurrentPolylines.setPath(p);
            } else if (viewModel.editedSegment()) {
                var polylines = viewModel.editedSegment().polylines;

                var p = polylines.getPath();
                if (atFirst) p.insertAt(0, latLng);
                else p.push(latLng);
                polylines.setPath(p);
            }
        }

        ep.messaging.read('MultiRando.Message.MapSettings.Queries.Get', {}, function (r) {
            var mapOptions = { center: { lat: parseFloat(r.MapCenterLat), lng: parseFloat(r.MapCenterLong) }, zoom: parseFloat(r.MapZoom), mapTypeId: r.MapTypeId };
            _this.initMap(mapOptions);
        });


        viewModel.activityFlags = _.filter(ep.toKeyValues(w.ActivityFlags), function (v) { return v.key != 'Private'; });
    };


    w.ActivityFlags = {
        Pedestrian: Math.pow(2, 1),
        Equestrian: Math.pow(2, 2),
        Quad: Math.pow(2, 3),
        Enduro: Math.pow(2, 4),
        Car: Math.pow(2, 5),
        Private: Math.pow(2, 30)
    }

}(window, window.ko, window._, window.$, window.google, window.ep));