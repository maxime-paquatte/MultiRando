/// <reference path="../model/Resource.js" />

(function () {
    var vm = window.ep.vm;

    vm.Resource = vm.Resource || {};

    vm.Resource.ListItem = vm.ViewModelBase.extend({
        constructor: function (model, options) {
            options = _.extend({}, options, {
                factories: {
                    'Values.models': vm.Resource.Value
                }
            });
            vm.ViewModelBase.prototype.constructor.call(this, model, options);

        }
    });
    vm.Resource.Collection = function (collection) { return new vm.CollectionObservableBase(collection, { view_model: vm.Resource.ListItem }); };

    vm.Resource.Value = vm.ViewModelBase.extend({
        constructor: function (model, options) {
            vm.ViewModelBase.prototype.constructor.call(this, model, options);
            var _this = this;

            this.save = function (v, e) {
                return ep.messaging.send('Neva.Resource.Messages.Commands.SetValue', _this.model().toJSON(),
                {
                    'Neva.Resource.Messages.Events.ValueChanged': function (d) {
                        ep.setSuccessState(e.currentTarget);
                    }
                });
            };
        }
    });
    vm.Resource.Culture = vm.ViewModelBase.extend({});
    vm.Resource.CultureCollection = function (collection, options) { return new vm.CollectionObservableBase(collection, { view_model: vm.Resource.Culture, options: options }); };

})();