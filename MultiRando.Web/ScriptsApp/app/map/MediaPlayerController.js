
/// <reference path="~/ScriptsApp/main.js" />

(function (w, ko, _, $, google, ep) {

    var vm = ep.vm;

    w.map = w.map || {};
    w.map.MediaPlayerController = function (mapCtrl, viewModel, mediaPlayer) {
        console.log("MediaPlayerController loaded");

        var _this = this;
        _this.marker = null;
        _this.lastSelectedTrack = null;

        viewModel.mediaUrl = ko.observable('');
        viewModel.localMediaplayerDelta = ko.observable(0);
        viewModel.mediaInputChange = function (data, event) {
            var files = event.target.files;
            viewModel.mediaUrl(URL.createObjectURL(files[0]));
            event.target.value = null;
        }

        _this.currentSecond = 0;
        viewModel.timeupdate = function (d, e) {
            var s = parseInt(mediaPlayer.currentTime);
            if (_this.currentSecond !== s)
                _this.fetchPoint(_this.currentSecond = s);
        }

        var fetching = false;
        _this.fetchPoint = function (nbSeconds) {
            if (!fetching && _this.marker && _this.lastSelectedTrack) {
                fetching = true;
                ep.messaging.read('MultiRando.Message.Track.Queries.PointAtTime', { TrackId: _this.lastSelectedTrack.TrackId(), NbSeconds: nbSeconds + parseInt(viewModel.localMediaplayerDelta()) }, function (r) {
                    var pos = new google.maps.LatLng(r.Lat, r.Lon);
                    _this.marker.setPosition(pos);
                    //if (mapCtrl.pointDistance(mapCtrl.map.getCenter(), pos) > 0.02)
                    //mapCtrl.map.setCenter(pos);
                    fetching = false;
                });
            }
        }

        mapCtrl.on('initialized.map', function(map) {
            _this.marker = new w.google.maps.Marker({ draggable: true, label: '>', title: 'Media position', map: map });
            google.maps.event.addListener(_this.marker, 'dragend', function (event) {
               if (_this.marker && _this.lastSelectedTrack) {
                   var pos = _this.marker.getPosition();
                   ep.messaging.read('MultiRando.Message.Track.Queries.TimeAtPoint', { TrackId: _this.lastSelectedTrack.TrackId(), Lat: pos.lat(), Lon: pos.lng() }, function (r) {
                       if (r.NbSeconds) {
                         var pos = new google.maps.LatLng(r.Lat, r.Lon);
                         _this.marker.setPosition(pos);
                         mediaPlayer.currentTime = parseInt(r.NbSeconds) - parseInt(viewModel.localMediaplayerDelta());
                     }
                   });
               }
            });
        });

        mapCtrl.on('selected.track.map', function (a) {
            _this.lastSelectedTrack = a.track;
            _this.marker.setVisible(true);
            _this.snapToRoute = new vm.SnapToRoute(mapCtrl.map, _this.marker, a.track.polylines);;
        });
        mapCtrl.on('unselected.track.map', function (a) {
            if (_this.lastSelectedTrack === a.track) {
                _this.lastSelectedTrack = null;
                _this.marker.setVisible(false);
            }
        });
    };


}(window, window.ko, window._, window.$, window.google, window.ep));