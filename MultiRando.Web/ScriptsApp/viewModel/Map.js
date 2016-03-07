/// <reference path="../model/Resource.js" />

(function(w, ko, ep) {
    var vm = ep.vm;

    vm.Map = vm.Resource || {};

    vm.Map.Segment = function(mapCtrl, options) {

        var _this = this;

        var a = _.find(ep.toKeyValues(w.ActivityFlags), function(v) { return v.val == options.currentActivity });
        _this.currentActivityName = a ? a.key : '';
        _this.defaultColor = '#00FFFF';
        _this.SegmentId = ko.observable(0);
        _this.CreatorDisplayName = ko.observable('');
        _this.CreationDate = ko.observable(w.moment().toISOString());
        _this.isSelected = ko.observable(false);
        _this.isCut = ko.observable(false);
        _this.ActivityFlag = ko.observable(0).extend({ bitFlag: {} });

        _this.Mudding = ko.observable(0);
        _this.Elevation = ko.observable(0);
        _this.Scree = ko.observable(0);
        _this.IsPrivate = ko.observable(false);
        _this.IsRoad = ko.observable(false);
        _this.NoWay = ko.observable(false);

        _this.CurrentActivityNoWay = ko.computed(function() {
            return _this.ActivityFlag.hasFlag(options.currentActivity);
        });

        _this.getColor = function() {
            if (_this.isSelected()) return w.map.MapController.constants.ColorSegmentEdit;
            if (_this.IsPrivate()) return w.map.MapController.constants.ColorSegmentIsPrivate;
            if (_this.IsRoad()) return w.map.MapController.constants.ColorSegmentRoad;
            if (_this.NoWay()) return w.map.MapController.constants.ColorSegmentNoWay;
            var max = Math.max(parseInt(_this.Mudding()), parseInt(_this.Elevation()), parseInt(_this.Scree()));

            return _this.CurrentActivityNoWay()
                ? w.map.MapController.constants.ColorSegmentWrongActivityFlag
                : ep.getGreenToRedColor((max + 1) / 6);
        }

        var startMarker, endMarker;
        _this.isSelected.subscribe(function(nv) {
            if (nv) {
                _this.polylines.setOptions({
                    strokeColor: w.map.MapController.constants.ColorSegmentEdit,
                    strokeWeight: w.map.MapController.constants.StrokeWeightSegmentEdit,
                    zIndex: 1
                });
                var p = _this.polylines.getPath().getArray();
                startMarker = new w.google.maps.Marker({ position: p[0], label: 'A', title: 'début', map: mapCtrl.map });
                endMarker = new w.google.maps.Marker({ position: p[p.length - 1], label: 'B', title: 'fin', map: mapCtrl.map });
            } else {
                _this.polylines.setOptions({
                    strokeColor: _this.getColor(),
                    strokeWeight: w.map.MapController.constants.StrokeWeightSegmentDefault,
                    zIndex: 20
                });
                if (startMarker != null) startMarker.setMap(null);
                if (endMarker != null) endMarker.setMap(null);
            }
        });

        _this.polylines = mapCtrl.loadPolyline([], {
            editable: false,
            zIndex: 20,
            strokeColor: _this.getColor()
        });

        _this.polylines.addListener('click', function(e) {
            if (_this.isCut()) _this.cut(e.vertex);
            else options.onClick(_this);
        });

        _this.polylines.addListener('rightclick', function(e) {
            if (!_.isUndefined(e.vertex)) {
                var p = _this.polylines.getPath().getArray();
                p.splice(e.vertex, 1);
                _this.polylines.setPath(p);
            }
        });

        _this.polylines.addListener('mouseover', function(e) {
            _this.polylines.setOptions({ strokeColor: w.map.MapController.constants.ColorSegmentEdit });
            if (!mapCtrl.CurrentPolylines) {
                var content = ko.renderTemplateX('segment-info-template', _this);
                mapCtrl.showInfo(content, new google.maps.LatLng(e.latLng.lat(), e.latLng.lng()));
            }
        });
        _this.polylines.addListener('mouseout', function(e) {
            _this.polylines.setOptions({
                strokeColor: _this.getColor(),
            });
            mapCtrl.closeInfo();
        });


        _this.loadData = function(data) {
            ko.mapping.fromJS(data, {
                'IsPublic': { create: function(o) { return parseInt(o.data); } },
                'IsRoad': { update: function(o) { return o.data !== "0" ? true : false; } },
                'IsPrivate': { update: function(o) { return o.data !== "0" ? true : false; } },
                'NoWay': { update: function(o) { return o.data !== "0" ? true : false; } },
                'ignore': ["Polylines"]
            }, _this);

            if (_this.isCut() || !_this.isSelected()) {
                var path = data.Polylines ? mapCtrl.parsePolyLines(data.Polylines) : [];
                _this.polylines.setPath(path);
                _this.polylines.setOptions({ strokeColor: _this.getColor() });
            }
        };


        _this.cut = function(cutPos) {
            if (cutPos) {
                var p = _this.polylines.getPath().getArray();
                var a = p.slice(0, cutPos + 1);
                var b = p.slice(cutPos);

                //A should be the bigger
                if (a.length < b.length) {
                    var c = a;
                    a = b;
                    b = c;
                }

                var strA = mapCtrl.toCommandStr(a);
                var strB = mapCtrl.toCommandStr(b);
                ep.messaging.send('MultiRando.Message.Segment.Commands.Split', {
                    SegmentId: _this.SegmentId(),
                    PolylinesA: strA,
                    PolylinesB: strB
                }, {
                    'MultiRando.Message.Segment.Events.Splitted': function(r) {
                        mapCtrl.segmentController.fetchSegments(null, false);
                    }
                });
            }
        }


        _this.cancel = function() {
            _this.polylines.setOptions({
                strokeColor: _this.getColor(),
                zIndex: 1,
                editable: false
            });


            if (startMarker != null) startMarker.setMap(null);
            if (endMarker != null) endMarker.setMap(null);
        }


        mapCtrl.on('changed.currentActivity.map', function(e) {
            options.currentActivity = e.activity;
            _this.polylines.setOptions({ strokeColor: _this.getColor() });
        });
    };

    vm.Map.Interest = function(data, options) {

        var _this = this;

        _this.InterestId = ko.observable(0);
        _this.ActivityFlag = ko.observable(0).extend({ bitFlag: {} });


        ko.mapping.fromJS(data || {}, { 'copy': ["Polylines"] }, _this);
    };

    vm.Map.Track = function(mapCtrl, data, options) {

        var _this = this;

        _this.TrackId = ko.observable(0);
        _this.Name = ko.observable('');
        _this.TrackLength = ko.observable(0);
        _this.isSelected = ko.observable(false);

        _this.polylines = null;
        _this.start = null;
        _this.select = function() {

            if (_this.polylines == null) {
                _this.polylines = mapCtrl.loadPolyline([], {
                    editable: false,
                    clickable: false,
                    zIndex: 15,
                    strokeColor: w.map.MapController.constants.ColorTrackDefault
                });
                ep.messaging.read('MultiRando.Message.Track.Queries.Line', {
                    TrackId: _this.TrackId()
                }, function(r) {
                    var path = r ? mapCtrl.parsePolyLines(r) : [];
                    _this.polylines.setPath(path);
                    _this.start = path[0];
                    _this.isSelected(true);
                });
            } else {

                if (!_this.polylines.getMap()) {
                    _this.polylines.setMap(mapCtrl.map);
                    _this.isSelected(true);
                } else {
                    _this.polylines.setMap(null);
                    _this.isSelected(false);
                }
            }
        }

        _this.showStart = function() {
            mapCtrl.map.setCenter(_this.start);
        };

        _this.rename = function() {
            w.alertify.prompt(ep.res('Res.Page.Map.Track.PrompteName'), _this.Name(), function(ok, str) {
                ep.messaging.send('MultiRando.Message.Track.Commands.Rename', { TrackId: _this.TrackId(), Name: str }, {
                    'MultiRando.Message.Track.Events.Changed': function(r) {
                        _this.Name(str);
                        ep.stdSuccessCallback();
                    }
                });
            });
        }

        ko.mapping.fromJS(data || {}, {
            TrackLength: { update: function (o) { return parseInt(o.data); } }
        }, _this);
    };

    vm.Map.Route = function(mapCtrl, data, options) {

        var _this = this;

        _this.RouteId = ko.observable(0);
        _this.Name = ko.observable('');
        _this.RouteLength = ko.observable(0);
        _this.IsPublic = ko.observable(false);
        _this.isSelected = ko.observable(false);
        _this.isEdit = ko.observable(false);

        _this.isShortcutMode = ko.observable(false);
        _this.shortcutStart = null;

        _this.polylines = null;
        _this.select = function() {

            if (_this.polylines == null) {
                _this.polylines = mapCtrl.loadPolyline([], {
                    editable: false,
                    zIndex: 99,
                    strokeColor: w.map.MapController.constants.ColorRouteDefault
                });
                _this.polylines.addListener('click', function (e) {
                    if (_this.isShortcutMode() && !_.isUndefined(e.vertex)) {
                        if (_this.shortcutStart != null) {
                            var a = _this.shortcutStart < e.vertex ? _this.shortcutStart : e.vertex;
                            var b = _this.shortcutStart > e.vertex ? _this.shortcutStart : e.vertex;
                            var p = _this.polylines.getPath().getArray();
                            p.splice(a, b-a);
                            _this.polylines.setPath(p);
                            _this.shortcutStart = null;
                            _this.isShortcutMode(false);
                        } else _this.shortcutStart = e.vertex;

                    }
                });
                _this.polylines.addListener('rightclick', function(e) {
                    if (!_.isUndefined(e.vertex)) {
                        var p = _this.polylines.getPath().getArray();
                        p.splice(e.vertex, 1);
                        _this.polylines.setPath(p);
                    }
                });
    

                mapCtrl.CurrentPolylines = _this.polylines;
                var id = _this.RouteId();
                if (id) {
                    ep.messaging.read('MultiRando.Message.Route.Queries.Line', {
                        RouteId: _this.RouteId()
                    }, function(r) {
                        var path = r ? mapCtrl.parsePolyLines(r) : [];
                        _this.polylines.setPath(path);
                    });
                }
            } else {
                mapCtrl.CurrentPolylines = _this.polylines;
                _this.polylines.setMap(mapCtrl.map);
            }

            mapCtrl.trigger("selected.route.map", { route: _this });
            _this.isSelected(true);
        }

        _this.isEdit.subscribe(function(nv) {
            if (nv) _this.polylines.setOptions({ editable: true });
            else _this.polylines.setOptions({ editable: false });
        });

        _this.edit = function () {
            _this.isEdit(true);
        }

        _this.showStart = function() {
            var path = _this.polylines.getPath().getArray();
            if (path.length) mapCtrl.map.setCenter(path[path.length - 1]);
        }

        _this.cancel = function () {
            if (!_this.isEdit()){
                _this.polylines.setMap(null);
                _this.isSelected(false);
                mapCtrl.CurrentPolylines = null;
                mapCtrl.trigger("canceled.route.map", { route: _this });
            } else _this.isEdit(false);
        }


        _this.rename = function() {
            w.alertify.prompt(ep.res('Res.Page.Map.Route.PrompteName'), _this.Name(), function(ok, str) {
                if (_this.RouteId()) {
                    ep.messaging.send('MultiRando.Message.Route.Commands.Rename', {
                        RouteId: _this.RouteId(),
                        Name: str
                    }, {
                        'MultiRando.Message.Route.Events.Changed': function(r) {
                            _this.Name(str);
                            ep.stdSuccessCallback();
                        }
                    });
                } else _this.Name(str);
            });
        }

        _this.addSegment = function(s) {
            var routePath = _this.polylines.getPath().getArray();
            var segmentPath = s.polylines.getPath().getArray();
            var p = _this.polylines.getPath();
            if (routePath.length) {
                var routelast = routePath[routePath.length - 1];

                var segmentFirst = segmentPath[0];
                var segmentLast = segmentPath[segmentPath.length - 1];

                var firstDistance = mapCtrl.pointDistance(routelast, segmentFirst);
                var lastDistance = mapCtrl.pointDistance(routelast, segmentLast);


                if (firstDistance < lastDistance) {
                    for (var i = 0; i < segmentPath.length; i++)
                        p.push(segmentPath[i]);
                } else {
                    for (var j = segmentPath.length - 1; j >= 0; j--)
                        p.push(segmentPath[j]);
                }
            } else {
                for (var k = 0; k < segmentPath.length; k++)
                    p.push(segmentPath[k]);

            }
            _this.polylines.setPath(p);
        };

        ko.mapping.fromJS(data || {}, {
            'IsPublic': { update: function(o) { return o.data !== "0" ? true : false; } }
        }, _this);
    };


    vm.Map.SegmentSelectedEventArg = function(s) {
        this.segment = s;
        this.canceled = false;
    };
})(window, ko, ep);