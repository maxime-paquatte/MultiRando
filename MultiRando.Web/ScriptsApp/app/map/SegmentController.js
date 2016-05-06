
/// <reference path="~/ScriptsApp/main.js" />

(function (w, ko, _, $, google, ep) {
    var vm = window.ep.vm;

    w.map = w.map || {};
    w.map.SegmentController = function (mapCtrl, viewModel) {
        console.log("SegmentController loaded");

        var _this = this;


        viewModel.segments = ko.observableArray();
        _this.fetchSegments = function (bounds, clear) {
            
            if (!bounds) bounds = mapCtrl.bound();
            if (clear) _this.clearSegments();
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
            var a = new vm.Map.SegmentSelectedEventArg(s);
            mapCtrl.trigger("selected.segment.map", a);
            if (!a.canceled) viewModel.selectSegment(s);
        };
        _this.clearSegments = function () {
            var ss = viewModel.segments();
            for (var i = 0; i < ss.length; i++) {
                ss[i].isSelected(true);
                ss[i].polylines.setMap(null);
            }
            viewModel.segments.removeAll();
            viewModel.selectedSegment(null);
        }

        viewModel.selectedSegment = ko.observable();

        viewModel.addSegment = function () {
            //Save current before create new
            var s = viewModel.selectedSegment();
            if (s) {
                _this.saveSegment(d).then(function() {
                    s = new vm.Map.Segment(mapCtrl, { onClick: _this.segmentClick });
                    viewModel.segments.push(s);
                    viewModel.selectSegment(s);
                });
            } else {
                s = new vm.Map.Segment(mapCtrl, { onClick: _this.segmentClick });
                viewModel.segments.push(s);
                viewModel.selectSegment(s);
            }
        }
        viewModel.selectSegment = function (r) {
            if (viewModel.selectedSegment())
                viewModel.cancelSegment(viewModel.selectedSegment());


            mapCtrl.CurrentPolylines = r.polylines;
            viewModel.selectedSegment(r);
            r.isSelected(true);
            r.polylines.setEditable(true);
        }
        viewModel.cancelSegment = function (r) {
            r.cancel();
            r.isSelected(false);
            r.polylines.setEditable(false);
            viewModel.selectedSegment(null);
            mapCtrl.CurrentPolylines = null;
        }
        viewModel.saveSegment = function(d) {
            _this.saveSegment(d);
        }
       
        viewModel.saveSegmentAndContinue = function(d) {
            _this.saveSegment(d).then(function()
            {
                var s = new vm.Map.Segment(mapCtrl, { onClick: _this.segmentClick });
                s.ActivityFlag(d.ActivityFlag());
                s.Mudding(d.Mudding());
                s.Elevation(d.Elevation());
                s.Scree(d.Scree());
                s.IsPrivate(d.IsPrivate());
                s.IsRoad(d.IsRoad());
                s.NoWay(d.NoWay());

                var dp = d.polylines.getPath().getArray();
                var sp = s.polylines.getPath().getArray();
                sp.push(dp[dp.length - 1]);
                s.polylines.setPath(sp);

                viewModel.segments.push(s);
                viewModel.selectSegment(s);
            });
        }

        _this.saveSegment = function (d) {
            var str = d.polylines.toCommandStr();
            return ep.messaging.send('MultiRando.Message.Segment.Commands.Update', { SegmentId: d.SegmentId(), ActivityFlag: d.ActivityFlag(), Mudding: d.Mudding(), Elevation: d.Elevation(), Scree: d.Scree(), IsPrivate: d.IsPrivate(), IsRoad: d.IsRoad(), NoWay: d.NoWay(), Polylines: str }, {
                'MultiRando.Message.Segment.Events.Changed': function (r) {
                    ep.stdSuccessCallback();
                    viewModel.cancelSegment(d);
                },
                'MultiRando.Message.Segment.Events.Created': function (r) {
                    d.SegmentId(r.segmentId);
                    ep.stdSuccessCallback();
                    viewModel.cancelSegment(d);
                }
            });
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

    };


}(window, window.ko, window._, window.$, window.google, window.ep));