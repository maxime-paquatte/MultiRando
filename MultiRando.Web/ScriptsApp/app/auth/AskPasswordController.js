
/// <reference path="~/ScriptsApp/main.js" />

(function (w, ko, $) {

    w.auth = w.auth || {};
    w.auth.AskPasswordController = function (viewModel, element, va, ava) {
        var _this = this;

        var errorMessage = ko.unwrap(ava().errorMessage);

        viewModel = viewModel.AskPasswordController = {};

        viewModel.succesMessage = ko.observable();
        viewModel.failMessage = ko.observable(errorMessage);

        viewModel.password = ko.observable('');
        viewModel.passwordConfirm = ko.observable('');
       
    };


}(window, window.ko, window.$));