
/// <reference path="~/ScriptsApp/main.js" />
/// <reference path="~/scripts/google.map.js" />

(function (w, ko, _, $, google, ep) {

    w.map = w.auth || {};
    w.map.MapController = function (viewModel, element, va, ava) {
        console.log("MapController loaded");

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
            ep.messaging.send('MultiRando.Message.UserSettings.Commands.Set', nv, {
            });
        });


        viewModel.bound = ko.observable({}).extend({ rateLimit: { timeout: 1000, method: "notifyWhenChangesStop" } });
        viewModel.bound.subscribe(function (nv) {
            _this.loadInterests(nv);
        });


        _this.interests = [];
        _this.loadInterests = function (bounds) {
            ep.messaging.read('MultiRando.Message.Interest.Queries.GetInBound', bounds, function (r) {

                _this.clearInterests();
                if (_.isArray(r)) {
                    for (var i = 0; i < r.length; i++) {
                        var interest = ko.mapping.fromJS(r[i], { 'copy': ["Polylines"] });
                        interest.ActivityFlag.extend({ bitFlag: {} });
                        var e = viewModel.editedInterest();
                        if (!e || e.InterestId != interest.InterestId)
                            _this.loadInterest(interest);
                    }
                }
            });
        }
        _this.loadInterest = function (interest) {
            var path = interest.Polylines ? _this.parsePolyLines(interest.Polylines) : [];

            var color = interest.ActivityFlag.hasFlag(ActivityFlags.Private) || interest.ActivityFlag.hasFlag(ActivityFlags[viewModel.currentActivity()]) ?
                '#FF0000' : '#FFCC00';
            var polylines = _this.loadPolyline(path, { strokeColor: color });

            interest.polylines = polylines;
            _this.interests.push(interest);

            if (interest.InterestId) {
                var iw = null;
                polylines.addListener('mouseover', function () {
                    var e = viewModel.editedInterest();
                    if (!e || e.InterestId != interest.InterestId) {
                        polylines.setOptions({ strokeWeight: 5 });

                        if (iw) iw.close();
                        var center = path[0];
                        iw = new google.maps.InfoWindow({
                            position: center,
                            content: ko.renderTemplateX('interest-details', interest, rootCtx)
                        });
                        iw.open(_this.map);
                    }
                });
                polylines.addListener('mouseout', function () {
                    if (iw) iw.close();

                    polylines.setOptions({ strokeWeight: 2 });
                });

                polylines.addListener('click', function () {
                    viewModel.editInterest(interest);
                });
            }


            return interest;
        }
        _this.clearInterests = function () {
            var e = viewModel.editedInterest();

            for (var i = 0; i < _this.interests.length; i++) {
                var interest = _this.interests[i];
                if (!e || e.InterestId != interest.InterestId) {

                    interest.polylines.setMap(null);
                    google.maps.event.clearInstanceListeners(interest.polylines);
                }
            }
            _this.interests = [];
        }


        viewModel.editedInterest = ko.observable(null);

        viewModel.addInterest = function () {
            var s = _this.loadInterest({ InterestId: 0 });
            viewModel.editInterest(s);
        }
        viewModel.editInterest = function (s) {

            viewModel.editedInterest(s);
            s.polylines.setEditable(true);
        }
        viewModel.cancelInterest = function () {
            var s = viewModel.editedInterest();
            s.polylines.setMap(null);


            viewModel.editedInterest(null);
            _this.loadBound();
        }
        viewModel.saveInterest = function () {
            var data = ko.mapping.toJS(viewModel.editedInterest);
            data.Polylines = viewModel.editedInterest().polylines.toCommandStr();

            ep.messaging.send('MultiRando.Message.Interest.Commands.UpdateOrCreate', data, {
                'MultiRando.Message.Interest.Events.Changed': function (r) {
                    viewModel.cancelInterest();
                    ep.stdSuccessCallback();
                }
            });

        }



        viewModel.segments = ko.observableArray();
        _this.fetchSegments = function () {
            return ep.messaging.read('MultiRando.Message.Segment.Queries.GetPage', { Skip: 0, Take: 10, Total: -1 }, function (r) {
                var segments = _.map(r.items, function (i) {
                    return ko.mapping.fromJS(i, {
                        'IsPublic': { create: function (options) { return ko.observable(parseInt(options.data)); } }
                    });
                });
                viewModel.segments(segments);
            });
        }
        _this.fetchSegments();


        viewModel.selectedSegment = ko.observable();
        viewModel.selectedSegment.subscribe(function (nv) {
            if (nv) {
                ep.messaging.read('MultiRando.Message.Segment.Queries.GetPolyline', { SegmentId: nv.SegmentId }, function (r) {
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

        viewModel.addSegment = function () {
            w.alertify.prompt(ep.res('Res.Page.Map.PromptSegmentName'), '', function (ok, str) {
                if (ok) {
                    ep.messaging.send('MultiRando.Message.Segment.Commands.Create', { Name: str }, {
                        'MultiRando.Message.Segment.Events.Created': function (r) {
                            _this.fetchSegments().then(function () {
                                var s = _.find(viewModel.segments(), function (a) {
                                    return a.SegmentId == r.segmentId;
                                });
                                viewModel.selectedSegment(s);
                            });
                        }
                    });
                }
            });
        }
        viewModel.selectSegment = function (r) {
            viewModel.selectedSegment(r);
        }
        viewModel.cancelSegment = function (r) {
            viewModel.selectedSegment(null);
        }
        viewModel.saveSegment = function (d) {
            ep.messaging.send('MultiRando.Message.Segment.Commands.Update', { SegmentId: d.SegmentId, Name: d.Name, Comment: d.Comment, IsPublic: d.IsPublic ? true: false }, {
                'MultiRando.Message.Segment.Events.Changed': function(r) {
                    ep.stdSuccessCallback();
                    viewModel.selectedSegment(null);
                }
            });
        }

        viewModel.isSegmentPolylinesEdit = ko.observable(false);
        viewModel.isSegmentPolylinesEdit.subscribe(function (nv) {
            _this.CurrentPolylines.setEditable(nv);
        });
        viewModel.cancelSegmentPolylines = function () {
            viewModel.isSegmentPolylinesEdit(false);
        }
        viewModel.editSegmentPolylines = function (d) {
            viewModel.isSegmentPolylinesEdit(true);
        };
        viewModel.saveSegmentPolylines = function (r) {
            var str = _this.CurrentPolylines.toCommandStr();

            var pathLength = google.maps.geometry.spherical.computeLength(_this.CurrentPolylines.getPath()) / 1000;
            ep.messaging.send('MultiRando.Message.Segment.Commands.SetPolyline', { SegmentId: viewModel.selectedSegment().SegmentId, Polylines: str, PathLength: parseInt(pathLength) }, {
                'MultiRando.Message.Segment.Events.Changed': function () {
                    ep.stdSuccessCallback();
                    viewModel.isSegmentPolylinesEdit(false);
                }
            });
        }

        viewModel.deleteSegment = function (r) {
            w.alertify.confirm(ep.res('Res.Std.ConfirmDelete'), function () {
                ep.messaging.send('MultiRando.Message.Segment.Commands.Delete', { SegmentId: viewModel.selectedSegment().SegmentId }, {
                    'MultiRando.Message.Segment.Events.Deleted': function (e) {
                        viewModel.selectedSegment(null);
                        _this.fetchSegments().then(ep.stdSuccessCallback);
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
            } else if (viewModel.editedInterest()) {
                var polylines = viewModel.editedInterest().polylines;

                var p = polylines.getPath();
                if (atFirst) p.insertAt(0, latLng);
                else p.push(latLng);
                polylines.setPath(p);
            }
        }

        ep.messaging.read('MultiRando.Message.UserSettings.Queries.Get', {}, function (r) {
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