
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
            //if (clear) _this.clearSegments();
            var segmentIds = {};
            _.each(viewModel.segments(), function (s) { segmentIds[s.SegmentId()] = s; });
            return ep.messaging.read('MultiRando.Message.Segment.Queries.GetInBound', bounds, function (r) {
                for (var j = 0; j < r.length; j++) {
                    var d = r[j];
                    if (!segmentIds[d.SegmentId]) {
                        var s = new vm.Map.Segment(mapCtrl, {
                            onClick: _this.segmentClick,
                            currentActivity: viewModel.currentActivity()
                        });
                        s.loadData(d);
                        viewModel.segments.push(s);
                    } else segmentIds[d.SegmentId].loadData(d);
                }

            });
        }

        _this.segmentClick = function (s) {
            viewModel.selectSegment(s);
        };

        viewModel.selectedSegment = ko.observable();

        viewModel.addSegment = function () {
            //Save current before create new
            if (viewModel.selectedSegment()) {
                viewModel.saveSegmentPolylines();
                viewModel.cancelSegment(viewModel.selectedSegment());
            }

            var s = new vm.Map.Segment(mapCtrl,{ onClick: _this.segmentClick });
            viewModel.segments.push(s);
            viewModel.selectSegment(s);
            viewModel.editSegmentPolylines();
        }
        viewModel.selectSegment = function (r) {
            if (viewModel.selectedSegment())
                viewModel.cancelSegment(viewModel.selectedSegment());
            r.polylines.setOptions({
                strokeColor: w.map.MapController.constants.ColorSegmentEdit,
                strokeWeight: w.map.MapController.constants.StrokeWeightSegmentEdit,
                zIndex : 99
            });
            viewModel.selectedSegment(r);
        }
        viewModel.cancelSegment = function (r) {
            r.cancel();
           
            viewModel.selectedSegment(null);
            viewModel.isSegmentPolylinesEdit(false);
        }
        viewModel.saveSegment = function (d) {
            ep.messaging.send('MultiRando.Message.Segment.Commands.Update', { SegmentId: d.SegmentId(), ActivityFlag: d.ActivityFlag(), Mudding: d.Mudding, Elevation: d.Elevation, Scree: d.Scree, IsRoad: d.IsRoad }, {
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

            mapCtrl.CurrentPolylines = null;
        }
        viewModel.editSegmentPolylines = function (d) {
            var s = viewModel.selectedSegment();
            if (s) s.polylines.setEditable(true);
            viewModel.isSegmentPolylinesEdit(true);

            mapCtrl.CurrentPolylines = s.polylines;
        };
        viewModel.saveSegmentPolylines = function (r) {
            var s = viewModel.selectedSegment();
            if (s){
                var str = s.polylines.toCommandStr();
                ep.messaging.send('MultiRando.Message.Segment.Commands.SetPolyline', {
                    SegmentId: viewModel.selectedSegment().SegmentId(), Polylines: str}, {
                    'MultiRando.Message.Segment.Events.Changed': function () {
                        ep.stdSuccessCallback();
                        if (viewModel.selectedSegment() == s)
                            viewModel.cancelSegmentPolylines();
                    },
                    'MultiRando.Message.Segment.Events.Created': function (r) {
                        s.SegmentId(r.segmentId);
                        ep.stdSuccessCallback();
                        if (viewModel.selectedSegment() == s)
                            viewModel.cancelSegmentPolylines();
                    }
                });
            }
        }

        viewModel.deleteSegment = function (r) {
            w.alertify.confirm(ep.res('Res.Std.ConfirmDelete'), function () {
                ep.messaging.send('MultiRando.Message.Segment.Commands.Delete', { SegmentId: viewModel.selectedSegment().SegmentId() }, {
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
            viewModel.isSegmentPolylinesEdit(false);
        }
    };


}(window, window.ko, window._, window.$, window.google, window.ep));