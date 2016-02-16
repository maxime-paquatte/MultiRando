/// <reference path="../model/Resource.js" />

(function(w, ko, ep) {
    var vm = ep.vm;

    vm.Map = vm.Resource || {};

    vm.Map.Segment = function(mapCtrl, options) {

        var _this = this;

        _this.defaultColor = '#00FFFF';
        _this.SegmentId = ko.observable(0);
        _this.isSelected = ko.observable(false);
        _this.isCut = ko.observable(false);
        _this.ActivityFlag = ko.observable(0).extend({ bitFlag: {} });

        _this.Mudding = ko.observable(0);
        _this.Elevation = ko.observable(0);
        _this.Scree = ko.observable(0);
        _this.IsRoad = ko.observable(false);

        _this.getColor = function() {
            if (_this.isSelected()) return w.map.MapController.constants.ColorSegmentEdit;
            if (_this.IsRoad()) return w.map.MapController.constants.ColorSegmentRoad;
            var max = Math.max(parseInt(_this.Mudding()), parseInt(_this.Elevation()), parseInt(_this.Scree()));

            return _this.ActivityFlag.hasFlag(options.currentActivity)
                ? w.map.MapController.constants.ColorSegmentWrongActivityFlag
                : ep.getGreenToRedColor(max / 5);
        }

        _this.isSelected.subscribe(function(nv) {
            if (nv) {
                _this.polylines.setOptions({
                    strokeColor: w.map.MapController.constants.ColorSegmentEdit,
                    strokeWeight: w.map.MapController.constants.StrokeWeightSegmentEdit,
                    zIndex: 1
                });
            } else {
                _this.polylines.setOptions({
                    strokeColor: _this.getColor(),
                    strokeWeight: w.map.MapController.constants.StrokeWeightSegmentDefault,
                    zIndex: 20
                });
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
            if (!mapCtrl.CurrentPolylines) mapCtrl.showInfo("<h1>TEST</h1>", new google.maps.LatLng(e.latLng.lat() + 0.00005, e.latLng.lng() + 0.00005));
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
                'ignore': ["Polylines"]
            }, _this);

            var path = data.Polylines ? mapCtrl.parsePolyLines(data.Polylines) : [];
            _this.polylines.setPath(path);
            _this.polylines.setOptions({ strokeColor: _this.getColor() });
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

        _this.polylines = null;
        _this.start = null;
        _this.select = function() {

            if (_this.polylines == null) {
                _this.polylines = mapCtrl.loadPolyline([], {
                    editable: false,
                    zIndex: 15,
                    strokeColor: w.map.MapController.constants.ColorTrackDefault
                });
                ep.messaging.read('MultiRando.Message.Track.Queries.Line', {
                    TrackId: _this.TrackId()
                }, function(r) {
                    var path = r ? mapCtrl.parsePolyLines(r) : [];
                    _this.polylines.setPath(path);
                    mapCtrl.map.setCenter(_this.start = path[0]);
                });
            } else {

                if (!_this.polylines.getMap()) {
                    _this.polylines.setMap(mapCtrl.map);
                    mapCtrl.map.setCenter(_this.start);
                } else _this.polylines.setMap(null);
            }
        }

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

        ko.mapping.fromJS(data || {}, {}, _this);
    };
})(window, ko, ep);