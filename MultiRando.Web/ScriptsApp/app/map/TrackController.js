
/// <reference path="~/ScriptsApp/main.js" />
/// <reference path="~/scripts/google.map.js" />

(function (w, ko, _, $, google, ep) {
    var vm = window.ep.vm;

    w.map = w.map || {};
    w.map.TrackController = function (mapCtrl, viewModel) {
        console.log("TrackController loaded");

        var _this = this;
        
        viewModel.tracks = ko.observableArray();

        viewModel.progress = ko.observableArray();
        viewModel.gpxInputChange = function (data, event) {
            _this.uploadFiles(event.target.files);
        };


        _this.uploadFiles = function (files) {
            for (var i = 0; i < files.length; i++) {
                var f = files[i];
                var p = {
                    canceled: false,
                    name: f.name,
                    progress: ko.observable(0),
                    error: ko.observable(''),
                    cancel: function () {
                        var _p = this;
                        if (!_p.error()) {
                            w.alertify.confirm(ep.res('Res.Std.Confirm'), function (ok) {
                                if (ok) _p.trigger('cancelUpload.ep.AttachedFolder');
                            });
                        } else _p.trigger('cancelUpload.ep.AttachedFolder');
                    }
                };

                _.extend(p, w.Backbone.Events);
                viewModel.progress.push(p);


                var xhr = ep.uploadFile(f, '/map/uploadGpx/', function (r) {
                    if (r.result == 'success') {
                        viewModel.progress.remove(p);
                        _this.fetch();
                    } else {
                        p.error(r.message);
                        ep.showException(r.exId);
                    }
                }, function (percent) {
                    p.progress(percent);
                });


                p.on('cancelUpload.ep.AttachedFolder', function () {
                    viewModel.progress.remove(p);
                });
            }
        };

        _this.fetch = function() {
            return ep.messaging.read('MultiRando.Message.Track.Queries.ForActor', {}, function (r) {
                if (_.isArray(r)) {
                    viewModel.tracks(_.map(r, function (d) { return new vm.Map.Track(mapCtrl, d); }));
                } else viewModel.tracks([]);
            });
        }
        _this.fetch();
    };


}(window, window.ko, window._, window.$, window.google, window.ep));