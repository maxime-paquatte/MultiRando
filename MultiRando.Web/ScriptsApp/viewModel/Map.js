/// <reference path="../model/Resource.js" />

(function (ko, ep) {
    var vm = ep.vm;

    vm.Map = vm.Resource || {};

    vm.Map.Segment = function (mapCtrl, data, options) {

        var _this = this;

        _this.defaultColor = '#00FFFF';
        _this.isCut = ko.observable(false);
        _this.ActivityFlag = ko.observable(0).extend({ bitFlag: {} });
        
        ko.mapping.fromJS(data, {
            'IsPublic': { create: function (o) { return ko.observable(parseInt(o.data)); } },
            'ignore': ["Polylines"]
        }, _this);


        var path = mapCtrl.parsePolyLines(data.Polylines);
        _this.polylines = mapCtrl.loadPolyline(path, {
            editable: false,
            strokeColor: _this.defaultColor
        });

        _this.cut = function(cutPos) {
            if (cutPos) {
                var p = _this.polylines.getPath().getArray();
                var a = p.slice(0, cutPos + 1);
                var b = p.slice(cutPos);

                ep.messaging.send('MultiRando.Message.Segment.Commands.Clone', { SegmentId: _this.SegmentId() }, {
                    'MultiRando.Message.Segment.Events.Cloned': function (r) {

                        var strA = mapCtrl.toCommandStr(a);
                        var pA = mapCtrl.loadPolyline(a);
                        var pathLengthA = google.maps.geometry.spherical.computeLength(pA);
                        ep.messaging.send('MultiRando.Message.Segment.Commands.SetPolyline', {
                            SegmentId: _this.SegmentId,
                            Polylines: strA,
                            PathLength: parseInt(pathLengthA)
                        });

                        var strB = mapCtrl.toCommandStr(b);
                        var pB = mapCtrl.loadPolyline(b);
                        var pathLengthB = google.maps.geometry.spherical.computeLength(pB);
                        ep.messaging.send('MultiRando.Message.Segment.Commands.SetPolyline', {
                            SegmentId: r.newSegmentId,
                            Polylines: strB,
                            PathLength: parseInt(pathLengthB)
                        }, {
                            'MultiRando.Message.Segment.Events.Changed': function (r) {
                                  mapCtrl.segmentController.fetchSegments(null, true);
                             }
                        });
                    }
                });
            }
        }

        _this.polylines.addListener('click', function (e) {
            if (_this.isCut()) _this.cut(e.vertex);
            else options.onClick(_this);
        });
    };

    vm.Map.Interest = function (data, options) {

        var _this = this;

        _this.InterestId = ko.observable(0);
        _this.ActivityFlag = ko.observable(0).extend({ bitFlag: {} });

        
        ko.mapping.fromJS(data || {}, { 'copy': ["Polylines"] }, _this);
    };

})(ko, ep);