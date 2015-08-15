
/// <reference path="~/ScriptsApp/main.js" />

(function (w, ko, $) {

    w.auth = w.auth || {};
    w.auth.LoginRegisterController = function (viewModel, element, va, ava) {
        var _this = this;
        var loginVm = viewModel.Login = {};

        loginVm.email = ko.observable('');
        loginVm.password = ko.observable('');



        var registerVm = viewModel.Register = {};
        registerVm.email = ko.observable('');
        registerVm.password = ko.observable('');
        registerVm.passwordConfirm = ko.observable('');


    };


}(window, window.ko, window.$));