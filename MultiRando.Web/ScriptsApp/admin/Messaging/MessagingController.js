
/// <reference path="~/ScriptsApp/main.js" />

(function (w, ko, $) {


    w.MessagingController = function (viewModel, element, va, ava) {
        var _this = this;
        viewModel = viewModel.Messaging = {};


        viewModel.loading = ko.observable(true);
        viewModel.messages = ko.observableArray();
        viewModel.currentMessage = ko.observable();
        viewModel.sample = ko.observable();
        viewModel.result = ko.observable();
        viewModel.filter = ko.observable('');
        viewModel.filtered = ko.computed(function () {
            var filter = viewModel.filter().toLowerCase();
            var messages = viewModel.messages();
            if (!filter) return messages;
            return _.filter(messages, function (m) { return m.toLowerCase().indexOf(filter) >= 0; });
        });




        viewModel.refresh = function () {
            viewModel.loading(true);
            $.getJSON('/Admin/Messaging/Messages', function (data) {
                viewModel.messages(data.messages);
                viewModel.loading(false);
            });
        }

        viewModel.openMessage = function (m) {
            $.getJSON('/Admin/Messaging/Message/' + m, function (data) {
                var params = '';
                for (var i = 0; i < data.properties.length; i++) {
                    var p = data.properties[i];
                    p.val = ko.observable();
                    if (params) params += ", ";
                    params += p.name + ": ''";
                }
                viewModel.currentMessage(data);

                if (data.kind == 'Command')
                    viewModel.sample(" ep.messaging.send('" + data.name + "', {" + params + "}, { \r\n });");
                else if (data.kind == 'Query')
                    viewModel.sample(" ep.messaging.read('" + data.name + "', {" + params + "}, function(r) { \r\n });");
                else if (data.kind == 'Event')
                    viewModel.sample(" '" + data.name + "' : function(r) {  }");
            });
            window.scrollTo(0, 0);

        };
        viewModel.submit = function (m) {
            var data = {};
            for (var i = 0; i < m.properties.length; i++)
                data[m.properties[i].name] = m.properties[i].val();

            data["__debug"] = true;
            if (m.kind == 'Query') {
                w.ep.messaging.read(m.name, data, function (result) {
                    viewModel.result(JSON.stringify(result, null, 4));
                });
            }
            if (m.kind == 'Command') {
                w.ep.messaging.send(m.name, data, function (result) {
                    viewModel.result(JSON.stringify(result, null, 4));
                });
            }
        };

        viewModel.refresh();
    };


}(window, window.ko, window.$));