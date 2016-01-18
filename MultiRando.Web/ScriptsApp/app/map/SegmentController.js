
/// <reference path="~/ScriptsApp/main.js" />
/// <reference path="~/scripts/google.map.js" />

(function (w, ko, _, $, google, ep) {
    var vm = window.ep.vm;

    w.map = w.auth || {};
    w.map.SegmentController = function (mapCtrl, viewModel) {
        console.log("SegmentController loaded");

        var _this = this;


        viewModel.segments = ko.observableArray();
        _this.fetchSegments = function (bounds, clear) {
            if (!bounds) bounds = mapCtrl.bound();
            if (clear) _this.clearSegments();
            var segmentIds = _.map(viewModel.segments(), function (s){ return s.SegmentId() });
            return ep.messaging.read('MultiRando.Message.Segment.Queries.GetInBound', bounds, function (r) {
                for (var j = 0; j < r.length; j++) {
                    var d = r[j];
                    if (segmentIds.indexOf(d.SegmentId) == -1) {
                        var s = new vm.Map.Segment(mapCtrl, d, { onClick: _this.segmentClick });
                        viewModel.segments.push(s);
                    }
                }

            });
        }

        _this.segmentClick = function (s) {
            viewModel.selectSegment(s);
        };

        viewModel.selectedSegment = ko.observable();

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
            if (viewModel.selectedSegment())
                viewModel.cancelSegment(viewModel.selectedSegment());
            r.polylines.setOptions({
                strokeColor: 'red',
                zIndex : 99
            });
            viewModel.selectedSegment(r);
        }
        viewModel.cancelSegment = function (r) {
            r.polylines.setOptions({
                strokeColor: r.defaultColor,
                zIndex: 1
            });
            viewModel.selectedSegment(null);
            viewModel.isSegmentPolylinesEdit(false);
        }
        viewModel.saveSegment = function (d) {
            ep.messaging.send('MultiRando.Message.Segment.Commands.Update', { SegmentId: d.SegmentId, ActivityFlag: d.ActivityFlag(), Mudding: d.Mudding, Elevation: d.Elevation, Scree: d.Scree }, {
                'MultiRando.Message.Segment.Events.Changed': function (r) {
                    ep.stdSuccessCallback();
                    viewModel.cancelSegment(d);
                }
            });
        }

        viewModel.isSegmentPolylinesEdit = ko.observable(false);

        viewModel.cancelSegmentPolylines = function () {
            var s = viewModel.selectedSegment();
            if (s) s.polylines.setEditable(false);
            viewModel.isSegmentPolylinesEdit(false);
        }
        viewModel.editSegmentPolylines = function (d) {
            var s = viewModel.selectedSegment();
            if (s) s.polylines.setEditable(true);
            viewModel.isSegmentPolylinesEdit(true);
        };
        viewModel.saveSegmentPolylines = function (r) {
            var s = viewModel.selectedSegment();
            if (s){
                var str = s.polylines.toCommandStr();

                var pathLength = google.maps.geometry.spherical.computeLength(s.polylines.getPath());
                ep.messaging.send('MultiRando.Message.Segment.Commands.SetPolyline', { SegmentId: viewModel.selectedSegment().SegmentId, Polylines: str, PathLength: parseInt(pathLength) }, {
                    'MultiRando.Message.Segment.Events.Changed': function () {
                        ep.stdSuccessCallback();
                        viewModel.cancelSegmentPolylines();
                    }
                });
            }
        }

        viewModel.deleteSegment = function (r) {
            w.alertify.confirm(ep.res('Res.Std.ConfirmDelete'), function () {
                ep.messaging.send('MultiRando.Message.Segment.Commands.Delete', { SegmentId: viewModel.selectedSegment().SegmentId }, {
                    'MultiRando.Message.Segment.Events.Deleted': function (e) {
                        viewModel.selectedSegment(null);
                        _this.fetchSegments(null, true).then(ep.stdSuccessCallback);
                    }
                });
            });
        }

        _this.clearSegments = function() {
            var ss = viewModel.segments();
            for (var i = 0; i < ss.length; i++)
                ss[i].polylines.setMap(null);
            viewModel.segments.removeAll();
            viewModel.selectedSegment(null);
        }
    };


}(window, window.ko, window._, window.$, window.google, window.ep));