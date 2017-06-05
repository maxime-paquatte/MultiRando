
/// <reference path="~/ScriptsApp/main.js" />
/// <reference path="~/ScriptsApp/app/map/MapController.js" />
/// <reference path="~/scripts/google.map.js" />

(function (w, ko, _, $, Backbone, google, ep) {

    var vm = ep.vm;

    w.map = w.map || {};
    w.map.EmbedController = function (viewModel, element, va, ava) {
        console.log("EmbedController loaded");


        var trackId = ko.unwrap(ava().trackId);

        viewModel.pageHeight = ko.observable($(w).height());
        $(w).resize(function () { viewModel.pageHeight($(w).height()); });

      
        var _this = this;

        _this.map = new google.maps.Map(w.document.getElementById('map-canvas'), {
            center: { lat: 46.3240998, lng: 2.5689203 }, zoom: 15,
            mapTypeId: google.maps.MapTypeId.SATELLITE
        });



        ep.messaging.read('MultiRando.Message.Track.Queries.Line', { TrackId: trackId }, function (r) {
            var points = w.map.MapController.parsePolyLines(r);
            
            var bounds = new google.maps.LatLngBounds();
            for (var n = 0; n < points.length ; n++) {
                bounds.extend(points[n]);
            }
            _this.map.fitBounds(bounds);



            var polyline = new google.maps.Polyline({
                path: points,
                geodesic: true,
                strokeColor: 'red',
                strokeWeight: w.map.MapController.constants.StrokeWeightSegmentDefault,
                strokeOpacity: 1.0,
                editable: false
            });


            polyline.setMap(_this.map);
        });


    };


}(window, window.ko, window._, window.$, window.Backbone, window.google, window.ep));