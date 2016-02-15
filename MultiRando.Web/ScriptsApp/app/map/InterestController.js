
/// <reference path="~/ScriptsApp/main.js" />
/// <reference path="~/scripts/google.map.js" />

(function (w, ko, _, $, google, ep) {

    w.map = w.map || {};
    w.map.InterestController = function (mapCtrl, viewModel) {
        console.log("InterestController loaded");

        var _this = this;
        
        _this.interests = [];
        _this.fetchInterests = function (bounds) {
            ep.messaging.read('MultiRando.Message.Interest.Queries.GetInBound', bounds, function (r) {

                _this.clearInterests();
                if (_.isArray(r)) {
                    for (var i = 0; i < r.length; i++) {
                        var interest = new ep.vm.Map.Interest(r[i]);
                        var e = viewModel.editedInterest();
                        if (!e || e.InterestId != interest.InterestId)
                            _this.loadInterest(interest);
                    }
                }
            });
        }
        _this.loadInterest = function (interest) {
            var path = interest.Polylines ? _this.parsePolyLines(interest.Polylines) : [];

            var color = interest.ActivityFlag.hasFlag(w.ActivityFlags.Private) || interest.ActivityFlag.hasFlag(w.ActivityFlags[viewModel.currentActivity()]) ?
                '#FF0000' : '#FFCC00';
            var polylines = mapCtrl.loadPolyline(path, { strokeColor: color });

            interest.polylines = polylines;
            _this.interests.push(interest);

            if (interest.InterestId()) {
                var iw = null;
                polylines.addListener('mouseover', function () {
                    var e = viewModel.editedInterest();
                    if (!e || e.InterestId != interest.InterestId) {
                        polylines.setOptions({ strokeWeight: 5 });

                        if (iw) iw.close();
                        var center = path[0];
                        iw = new google.maps.InfoWindow({
                            position: center,
                            content: ko.renderTemplateX('interest-details', interest, rootCtx)
                        });
                        iw.open(_this.map);
                    }
                });
                polylines.addListener('mouseout', function () {
                    if (iw) iw.close();

                    polylines.setOptions({ strokeWeight: 2 });
                });

                polylines.addListener('click', function () {
                    viewModel.editInterest(interest);
                });
            }


            return interest;
        }
        _this.clearInterests = function () {
            var e = viewModel.editedInterest();

            for (var i = 0; i < _this.interests.length; i++) {
                var interest = _this.interests[i];
                if (!e || e.InterestId != interest.InterestId) {

                    interest.polylines.setMap(null);
                    google.maps.event.clearInstanceListeners(interest.polylines);
                }
            }
            _this.interests = [];
        }


        viewModel.editedInterest = ko.observable(null);

        viewModel.addInterest = function () {
            var s = new ep.vm.Map.Interest();
            _this.loadInterest(s);
            s.polylines.setEditable(true);
            viewModel.editInterest(s);
        }
        viewModel.editInterest = function (s) {

            viewModel.editedInterest(s);
            s.polylines.setEditable(true);
        }
        viewModel.cancelInterest = function () {
            var s = viewModel.editedInterest();
            s.polylines.setMap(null);


            viewModel.editedInterest(null);
            _this.loadBound();
        }
        viewModel.saveInterest = function () {
            var data = ko.mapping.toJS(viewModel.editedInterest);
            data.Polylines = viewModel.editedInterest().polylines.toCommandStr();

            ep.messaging.send('MultiRando.Message.Interest.Commands.UpdateOrCreate', data, {
                'MultiRando.Message.Interest.Events.Changed': function (r) {
                    viewModel.cancelInterest();
                    ep.stdSuccessCallback();
                }
            });

        }

    };


}(window, window.ko, window._, window.$, window.google, window.ep));