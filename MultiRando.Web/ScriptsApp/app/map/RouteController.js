
/// <reference path="~/ScriptsApp/main.js" />
/// <reference path="~/scripts/google.map.js" />

(function (w, ko, _, $, google, ep) {
    var vm = window.ep.vm;

    w.map = w.map || {};
    w.map.RouteController = function (mapCtrl, viewModel) {
        console.log("RouteController loaded");

        var _this = this;
        
        viewModel.routes = ko.observableArray();

        viewModel.addRoute = function () {
            w.alertify.prompt(ep.res('Res.Page.Map.Route.PrompteName'), '', function (e, str) {
                var r = new vm.Map.Route(mapCtrl, { Name: str });
                viewModel.routes.push(r);
                r.select();
            });
        }



        viewModel.saveRoute = function (r) {
            var str = r.polylines.toCommandStr();
            ep.messaging.send('MultiRando.Message.Route.Commands.UpdateOrCreate', {
                RouteId: r.RouteId(), Name: r.Name(), IsPublic: r.IsPublic(), LineString: str
            }, {
                'MultiRando.Message.Route.Events.Changed': function (e) {
                    ep.stdSuccessCallback();
                    r.cancel();
                },
                'MultiRando.Message.Route.Events.Created': function (e) {
                    ep.stdSuccessCallback();
                    r.RouteId(r.routeId);
                    r.cancel();
                }
            });
        }
      
        viewModel.deleteRoute = function(t) {
            w.alertify.confirm(ep.res('Res.Std.ConfirmDelete'), function(ok) {
                if (ok) {
                    if (t.RouteId()) {
                        ep.messaging.send('MultiRando.Message.Route.Commands.Delete', { RouteId: t.RouteId() }, {
                            'MultiRando.Message.Route.Events.Deleted': function(r) {
                                t.cancel();
                                _this.fetch().then(ep.stdSuccessCallback);
                            }
                        });
                    } else {
                        t.cancel();
                        viewModel.routes.remove(t);
                    }
                }
            });
        }

        _this.fetch = function () {
            var routeIds = {};
            _.each( viewModel.routes(), function (s) { routeIds[s.RouteId()] = s; });
            return ep.messaging.read('MultiRando.Message.Route.Queries.ForActor', {}, function (r) {
                if (_.isArray(r)) {
                    for (var i = 0; i < r.length; i++) {
                        var d = r[i];
                        if (!routeIds[d.RouteId]) {
                            viewModel.routes.push(new vm.Map.Route(mapCtrl, d));
                        } else delete routeIds[d.RouteId];
                    }
                }
                for (var id in routeIds) {
                    var t = routeIds[id];
                    if (t.isSelected()) t.select();
                    viewModel.routes.remove(t);
                }
            });
        }
        _this.fetch();

        _this.selectedRoute = null;
        mapCtrl.on('selected.route.map', function (e) {
            _.each(viewModel.routes(), function(r) {
                if (r.RouteId() != e.routeId && r.isSelected())
                    r.cancel();
            });
            _this.selectedRoute = e.route;
        });

        mapCtrl.on('selected.segment.map', function (e) {
            if (_this.selectedRoute) {
                e.canceled = true;
                _this.selectedRoute.addSegment(e.segment);
            }
        });
    };


}(window, window.ko, window._, window.$, window.google, window.ep));