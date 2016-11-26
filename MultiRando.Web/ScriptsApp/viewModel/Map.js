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
            return options.currentActivity != 0 && _this.ActivityFlag.hasFlag(options.currentActivity);
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
                startMarker = new w.google.maps.Marker({ clickable : false, position: p[0], label: 'A', title: 'début', map: mapCtrl.map });
                endMarker = new w.google.maps.Marker({ clickable: false, position: p[p.length - 1], label: 'B', title: 'fin', map: mapCtrl.map });
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

        _this.setStartMarker = function(pos) {
            if (startMarker != null) startMarker.setPosition(pos);
        }
        _this.setEndMarker = function (pos) {
            if (endMarker != null) endMarker.setPosition(pos);
        }

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
                        _this.isCut(false);
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

    vm.Map.Interest = function (mapCtrl, data, options) {

        var _this = this;

        var marker = new w.google.maps.Marker({
            position: new w.google.maps.LatLng(data.Lat, data.Lon),
            title: data.Comment,
            icon: '/Content/Images/Poi/' + data.Category + '.png',
            draggable: false,
            map: mapCtrl.map
        });


        _this.InterestId = parseInt(data.InterestId);
        _this.Category = data.Category;
        _this.CreatorUserId = parseInt(data.CreatorUserId);
        _this.CreationDate = data.CreationDate;
        _this.CreatorDisplayName = data.CreatorDisplayName;

        _this.medias = ko.observableArray();


        _this.Comment = ko.observable(data.Comment);
        _this.Comment.subscribe(function(nv) {
            marker.setOptions({ title: nv });
        });
        _this.IsPublic = ko.observable(data.IsPublic == "1");

        _this.select = function () {
            marker.setDraggable(_this.CreatorUserId == currentUser.UserId);
            marker.setAnimation(w.google.maps.Animation.BOUNCE);
            _this.fetchMedia();
        }
        _this.cancel = function () {
            marker.setDraggable(false);
            marker.setAnimation(null);
        };

        _this.remove = function() {
            marker.setMap(null);
        }

        _this.save = function() {
            ep.messaging.send('MultiRando.Message.Interest.Commands.Update', { InterestId: _this.InterestId, Comment: _this.Comment() }, {
                'MultiRando.Message.Interest.Events.Changed': function (r) { ep.stdSuccessCallback(); }
            });
        }


        _this.addYoutube = function() {
            alertify.prompt(ep.res("Res.Page.Map.Interest.Edit.PromptYoutubeUrl"), '', function (ok, str) {
                if (ok) {
                    var v = str.indexOf('v=');
                    if (v >= 0) {
                        var a = str.indexOf('&', v);
                        str = str.substring(v + 2, a >= 0 ? a : 9999);
                    } else {
                        var q = str.indexOf('?');
                        if (q >= 0) str = str.substr(0, q);
                        str = str.trim('/');
                        var s = str.lastIndexOf('/');
                        if (s >= 0) str = str.substr(s + 1);
                    }
                    if (str) _this.addMedia("YOUTUBE", str);
                }
            });
        };

        _this.addImage = function() {
            alertify.prompt(ep.res("Res.Page.Map.Interest.Edit.PromptImageUrl"), '', function(ok, str) {
                if (ok && str) _this.addMedia("IMAGE", str);
            });
        }

        _this.addMedia = function(mediaType, value) {
            ep.messaging.send('MultiRando.Message.Interest.Commands.AddMedia', { InterestId: _this.InterestId, MediaType: mediaType, Value: value }, {
                'MultiRando.Message.Interest.Events.MediaAdded': function (r) { _this.fetchMedia().then(ep.stdSuccessCallback); }
            });
        };

        _this.loadData = function(data) {
            _this.Comment(data.Comment);
            _this.IsPublic(data.IsPublic == "1");

            marker.setPosition(new w.google.maps.LatLng(data.Lat, data.Lon));
        };

        _this.fetchMedia = function() {
            return ep.messaging.read('MultiRando.Message.Interest.Queries.Medias', { InterestId: _this.InterestId }, function (r) {
                _this.medias(_.isArray(r) ? r : []);
            });
        };

         marker.addListener('click', function () {
             options.click(_this);
         });

        

         marker.addListener('dragend', function (e) {
             ep.messaging.send('MultiRando.Message.Interest.Commands.Move', {
                 InterestId: _this.InterestId,
                 Lat: e.latLng.lat(), Lon: e.latLng.lng()
             }, {
                 'MultiRando.Message.Interest.Events.Changed': function (r) { ep.stdSuccessCallback(); }
             });

         });
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
                    mapCtrl.trigger("selected.track.map", { track: _this });
                });


            } else {

                if (!_this.polylines.getMap()) {
                    _this.polylines.setMap(mapCtrl.map);
                    _this.isSelected(true);
                    mapCtrl.trigger("selected.track.map", { track: _this });
                } else {
                    _this.polylines.setMap(null);
                    _this.isSelected(false);
                    mapCtrl.trigger("unselected.track.map", { track: _this });
                }
            }
        }

        _this.toggleZIndex = function () {
            var z = _this.polylines.get('zIndex');
            _this.polylines.setOptions({ zIndex: z == 15 ? 99 : 15 });
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
                _this.polylines.setMap(mapCtrl.map);
            }

            mapCtrl.trigger("selected.route.map", { route: _this });
            _this.isSelected(true);
        }

        _this.isEdit.subscribe(function(nv) {
            if (nv) {
                mapCtrl.CurrentPolylines = _this.polylines;
                _this.polylines.setOptions({ editable: true });
            }
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


        _this.reverse = function () {
            var path = _this.polylines.getPath().getArray();
            path.reverse();
            _this.polylines.setPath(path);
        }

        ko.mapping.fromJS(data || {}, {
            'IsPublic': { update: function(o) { return o.data !== "0" ? true : false; } }
        }, _this);
    };


    vm.Map.InterestCategories = ['Landscape', 'Mud'];

    vm.Map.SegmentSelectedEventArg = function(s) {
        this.segment = s;
        this.canceled = false;
    };
})(window, ko, ep);