
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


        viewModel.isDragover = ko.observable(false);
        viewModel.dragInOut = function (d, e) {
            e.stopPropagation();
            e.preventDefault();
            viewModel.isDragover(e.type == "dragover");
        };
        viewModel.drop = function (d, e) {
            e.stopPropagation();
            e.preventDefault();
            viewModel.isDragover(false);

            var files = e.originalEvent.dataTransfer.files;
            _this.uploadFiles(files);
        };
        viewModel.trackInputChange = function(data, event) {
            _this.uploadFiles(event.target.files);
        }

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


                var xhr = ep.uploadFile(f, '/map/uploadTrack', function (r) {
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


        viewModel.deleteTrack = function(t) {
            w.alertify.confirm(ep.res('Res.Std.ConfirmDelete'), function(ok) {
                if (ok) {
                    ep.messaging.send('MultiRando.Message.Track.Commands.Delete', { TrackId: t.TrackId() }, {
                        'MultiRando.Message.Track.Events.Deleted': function (r) {
                            if (t.isSelected()) t.select();
                             _this.fetch().then(ep.stdSuccessCallback);
                        }
                    });
                }
            });
        }

        _this.fetch = function () {
            var trackIds = {};
            _.each(viewModel.tracks(), function (s) { trackIds[s.TrackId()] = s; });
            return ep.messaging.read('MultiRando.Message.Track.Queries.ForActor', {}, function (r) {
                if (_.isArray(r)) {
                    for (var i = 0; i < r.length; i++) {
                        var d = r[i];
                        if (!trackIds[d.TrackId]) {
                            viewModel.tracks.push(new vm.Map.Track(mapCtrl, d));
                        } else delete trackIds[d.TrackId];
                    }
                }
                for (var id in trackIds) {
                    var t = trackIds[id];
                    if (t.isSelected()) t.select();
                    viewModel.tracks.remove(t);
                }
            });
        }
        _this.fetch();
    };


}(window, window.ko, window._, window.$, window.google, window.ep));