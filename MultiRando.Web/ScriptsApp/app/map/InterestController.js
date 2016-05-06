
/// <reference path="~/ScriptsApp/main.js" />

(function (w, ko, _, $, google, ep) {

    var vm = ep.vm;

    w.map = w.map || {};
    w.map.InterestController = function (mapCtrl, viewModel) {
        console.log("InterestController loaded");

        var _this = this;

        viewModel.selectedInterest = ko.observable();
        viewModel.interests = ko.observableArray();

        _this.lastCreatedId = 0;
        _this.fetchInterests = function (bounds, clear) {

            if (!bounds) bounds = mapCtrl.bound();
            if (clear) _this.clearInterests();

            var ids = {};
            _.each(viewModel.interests(), function (s) { ids[s.InterestId] = s; });

            return ep.messaging.read('MultiRando.Message.Interest.Queries.GetInBound', bounds, function (r) {
                for (var j = 0; j < r.length; j++) {
                    var d = r[j];
                    if (!ids[d.InterestId]) {
                        var s = new vm.Map.Interest(mapCtrl, d, { click: _this.selected });
                        if (_this.lastCreatedId == s.InterestId) {
                            _this.selected(s);
                            _this.lastCreatedId = null;
                        }
                        viewModel.interests.push(s);
                    } else ids[d.InterestId].loadData(d);
                }
            });
            
        }

        _this.selected = function(m) {
            var s = viewModel.selectedInterest();
            if (s) s.cancel();
            if(m) m.select();
            viewModel.selectedInterest(m);
        };

        _this.clearInterests = function() {
            var ss = viewModel.interests();
            for (var i = 0; i < ss.length; i++) {
                ss[i].remove();
            }
            viewModel.interests.removeAll();
            viewModel.selectedInterest(null);
        }

        viewModel.deleteInterest = function(i) {
            alertify.confirm(ep.res('Res.Std.ConfirmDelete'), function(ok) {
                if (ok) ep.messaging.send('MultiRando.Message.Interest.Commands.Delete', { InterestId: i.InterestId }, {
                    'MultiRando.Message.Interest.Events.Deleted': function (r) {
                        _this.fetchInterests(null, true).then(ep.stdSuccessCallback);
                    }
                });
            });

        };
        viewModel.cancelInterest = function (i) {
            _this.selected(null);
        };

        _this.catToAdd = null;
        viewModel.addInterest = function (cat) {
            _this.catToAdd = cat;
        };


        mapCtrl.on('selected.segment.map', function (e) {
            _this.selected(null);
        });
        mapCtrl.on('click.map', function (e) {
            if (_this.catToAdd) {
                ep.messaging.send('MultiRando.Message.Interest.Commands.Create', { Category: _this.catToAdd, Lat: e.lat, Lon: e.lng }, {
                    'MultiRando.Message.Interest.Events.Created': function (r) {
                        _this.lastCreatedId = r.interestId;
                        _this.fetchInterests().then(ep.stdSuccessCallback);
                    }
                });
                _this.catToAdd = null;
            }
            else _this.selected(null);
            e.canceled = true;
        });
    };


}(window, window.ko, window._, window.$, window.google, window.ep));