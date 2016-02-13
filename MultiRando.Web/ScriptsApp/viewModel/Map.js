/// <reference path="../model/Resource.js" />

(function(w, ko, ep) {
    var vm = ep.vm;

    vm.Map = vm.Resource || {};

    vm.Map.Segment = function(mapCtrl, options) {

        var _this = this;

        _this.defaultColor = '#00FFFF';
        _this.SegmentId = ko.observable(0);
        _this.isCut = ko.observable(false);
        _this.ActivityFlag = ko.observable(0).extend({ bitFlag: {} });

        _this.Mudding = ko.observable(0);
        _this.Elevation = ko.observable(0);
        _this.Scree = ko.observable(0);
        _this.IsRoad = ko.observable(false);

        _this.getColor = function () {
            if (_this.IsRoad()) return w.map.MapController.constants.ColorSegmentRoad;
            var max = Math.max(parseInt(_this.Mudding()) , parseInt(_this.Elevation()) , parseInt(_this.Scree()));

            return _this.ActivityFlag.hasFlag(options.currentActivity)
                ? w.map.MapController.constants.ColorSegmentWrongActivityFlag
                : ep.getGreenToRedColor(max / 5);
        }

        _this.polylines = mapCtrl.loadPolyline([], {
            editable: false,
            strokeColor: _this.getColor()
        });

        _this.polylines.addListener('click', function (e) {
            if (_this.isCut()) _this.cut(e.vertex);
            else options.onClick(_this);
        });

        _this.polylines.addListener('mouseover', function (e) {
            _this.polylines.setOptions({ strokeWeight: w.map.MapController.constants.StrokeWeightSegmentOver });
            mapCtrl.showInfo("<h1>TEST</h1>", new google.maps.LatLng( e.latLng.lat() + 0.00005, e.latLng.lng() + 0.00005));
        });
        _this.polylines.addListener('mouseout', function (e) {
            _this.polylines.setOptions({
                strokeWeight: w.map.MapController.constants.StrokeWeightSegmentDefault
            });
            mapCtrl.closeInfo();
        });



        _this.loadData = function(data) {
            ko.mapping.fromJS(data, {
                'IsPublic': { create: function (o) { return parseInt(o.data); } },
                'IsRoad': { update: function(o) {return o.data !== "0" ? true : false;} },
                'ignore': ["Polylines"]
            }, _this);

            var path = data.Polylines ? mapCtrl.parsePolyLines(data.Polylines) : [];
            _this.polylines.setPath(path);
            _this.polylines.setOptions({ strokeColor : _this.getColor()});
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

                ep.messaging.send('MultiRando.Message.Segment.Commands.Clone', { SegmentId: _this.SegmentId() }, {
                    'MultiRando.Message.Segment.Events.Cloned': function(r) {

                        var strA = mapCtrl.toCommandStr(a);
                        ep.messaging.send('MultiRando.Message.Segment.Commands.SetPolyline', {
                            SegmentId: _this.SegmentId,
                            Polylines: strA
                        });

                        var strB = mapCtrl.toCommandStr(b);
                        ep.messaging.send('MultiRando.Message.Segment.Commands.SetPolyline', {
                            SegmentId: r.newSegmentId,
                            Polylines: strB
                        }, {
                            'MultiRando.Message.Segment.Events.Changed': function(r) {
                                mapCtrl.segmentController.fetchSegments(null, true);
                            }
                        });
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

})(window, ko, ep);