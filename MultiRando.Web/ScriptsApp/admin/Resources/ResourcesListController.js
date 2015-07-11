
/// <reference path="~/ScriptsApp/main.js" />
/// <reference path="~/ScriptsApp/ep.PromptFreeTxt.js" />

(function (w, ko, $, vm, model) {

    w.ResourcesListController = function (viewModel, element, va, ava) {
        var _this = this;
        viewModel = viewModel.Resources = {};

        var resName = ko.utils.unwrapObservable(ava().resName || '').trim("?");

        var resources = new model.ResourceCollection(null);
        var cultures = new model.ResourceCultureCollection(null);


        viewModel.filter = new vm.TextFilterViewModel(resources, { queryName: 'Prefix', filter: resName });
        viewModel.pagination = new vm.PaginationViewModel(resources);
        viewModel.resources = vm.Resource.Collection(resources);

        viewModel.cultures = vm.Resource.CultureCollection(cultures);



        viewModel.editComment = function (r, event) {
            window.ep.promptFreeTxt('Comment', function (nv) {

                ep.messaging.send('Neva.Resource.Messages.Commands.SetComment', { ResId: r.ResId, Comment: nv },
                {
                    'Neva.Resource.Messages.Events.CommentChanged': function (d) {
                        r.Comment(nv);
                        ep.stdSuccessCallback();
                    }
                });
            }, r.Comment());
        };

        viewModel.fieldClick = function (r, event) {
            if (event.ctrlKey) {
                window.ep.promptFreeTxt('Resource Value', function (nv) {
                    r.Value(nv);
                    r.save(r, event).then(ep.stdSuccessCallback);
                }, r.Value());
            }
        };

        resources.fetch({ url: '/query/Neva.Resource.Messages.Queries.ByPrefix/' });
        cultures.fetch({ url: '/query/Neva.Resource.Messages.Queries.AllCultures/' });

    };


}(window, window.ko, window.$, window.ep.vm, window.ep.model));