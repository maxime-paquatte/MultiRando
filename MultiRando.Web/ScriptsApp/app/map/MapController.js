
/// <reference path="~/ScriptsApp/main.js" />
/// <reference path="~/scripts/google.map.js" />

(function (w, ko, $, google, ep) {

    w.map = w.auth || {};
    w.map.MapController = function (viewModel, element, va, ava) {
        var _this = this;
        viewModel = viewModel.Map = {};

        viewModel.mapCenter = ko.observable({}).extend({ rateLimit: { timeout: 5000, method: "notifyWhenChangesStop" } });;
        viewModel.mapCenter.subscribe(function (nv) {
            ep.messaging.send('MultiRando.Message.MapSettings.Commands.Set', nv, {
            });
        });
        viewModel.pageHeight = ko.observable($(window).height());
        $(window).resize(function () {
            viewModel.pageHeight($(window).height());
        });


        _this.route = null;
        _this.loadRoute = function (path) {
            _this.route = new google.maps.Polyline({
                path: path,
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2,
                editable: true
            });

            _this.route.addListener('dblclick', function (e) {
                var p = _this.route.getPath();
                p.removeAt(e.vertex);
                _this.route.setPath(p);
            });

            _this.route.setMap(_this.map);
        }
        _this.cancelRoute = function () {
            if (_this.route) _this.route.setMap(null);
            _this.route = null;
        }


        viewModel.selectedRoute = ko.observable();
        viewModel.selectedRoute.subscribe(function (nv) {
            if (nv) {
                ep.messaging.read('MultiRando.Message.Route.Queries.GetPolyline', { RouteId: nv.RouteId }, function (r) {
                    if (r.Polygon) {
                        var parts = r.Polygon.substr('"MULTIPOINT '.length).replace(/\(/g, '').replace(/\)/g, '').split(',');
                        var path = _.map(parts, function (p) {
                            var ll = p.trim().split(' ');
                            return new google.maps.LatLng(ll[1], ll[0]);
                        });

                        _this.loadRoute(path);
                    } else {
                        _this.loadRoute([]);
                    }
                });
            } else {
                _this.cancelRoute();
            }
        });
        viewModel.routes = ko.observableArray();
        _this.fetchRoutes = function () {
            return ep.messaging.read('MultiRando.Message.Route.Queries.GetPage', { Skip: 0, Take: 10, Total: -1 }, function (r) {
                viewModel.routes(r.items);
            });
        }
        _this.fetchRoutes();
        viewModel.addRoute = function () {
            w.alertify.prompt(ep.res('Res.Page.Map.PromptRouteName'), '', function (ok, str) {
                if (ok) {
                    ep.messaging.send('MultiRando.Message.Route.Commands.Create', { Name: str }, {
                        'MultiRando.Message.Route.Events.Created': function (r) {
                            _this.fetchRoutes().then(function () {
                                var s = _.find(viewModel.routes(), function (a) {
                                    return a.RouteId == r.routeId;
                                });
                                viewModel.selectedRoute(s);
                            });
                        }
                    });
                }
            });
        }
        viewModel.selectRoute = function (r) {
            viewModel.selectedRoute(r);
        }
        viewModel.cancelRoute = function (r) {
            viewModel.selectedRoute(null);
        }
        viewModel.saveRoute = function (r) {
            var str = _.toArray(_.map(_this.route.getPath().getArray(), function (p) { return '(' + p.lng() + ' ' + p.lat() + ')'; })).join(',');

            ep.messaging.send('MultiRando.Message.Route.Commands.SetPolyline', { RouteId: viewModel.selectedRoute().RouteId, Polygon: str }, {
                'MultiRando.Message.Route.Events.Changed': ep.stdSuccessCallback
            });
        }
        viewModel.deleteRoute = function (r) {
            w.alertify.confirm(ep.res('Res.Std.ConfirmDelete'), function () {
                ep.messaging.send('MultiRando.Message.Route.Commands.Delete', { RouteId: viewModel.selectedRoute().RouteId }, {
                    'MultiRando.Message.Route.Events.Deleted': function (e) {
                        viewModel.selectedRoute(null);
                        _this.fetchRoutes().then(ep.stdSuccessCallback);
                    }
                });
            });
        }
        _this.changeMapPos = function () {
            var c = _this.map.getCenter();
            viewModel.mapCenter({
                Lat: c.lat(), Long: c.lng(),
                Zoom: _this.map.getZoom(),
                MapTypeId: _this.map.getMapTypeId()
            });
        }

        _this.initMap = function (mapOptions) {

            _this.map = new google.maps.Map(w.document.getElementById('map-canvas'), mapOptions);
            _this.map.addListener('center_changed', _this.changeMapPos);
            _this.map.addListener('zoom_changed', _this.changeMapPos);
            _this.map.addListener('maptypeid_changed', _this.changeMapPos);

            _this.map.addListener('click', function (e) {
                if (_this.route) {
                    var p = _this.route.getPath();
                    p.push(e.latLng);
                    _this.route.setPath(p);
                }
            });
        }


        ep.messaging.read('MultiRando.Message.MapSettings.Queries.Get', {}, function (r) {
            var mapOptions = { center: { lat: parseFloat(r.MapCenterLat), lng: parseFloat(r.MapCenterLong) }, zoom: parseFloat(r.MapZoom), mapTypeId: r.MapTypeId };
            _this.initMap(mapOptions);
        });



    };


}(window, window.ko, window.$, window.google, window.ep));