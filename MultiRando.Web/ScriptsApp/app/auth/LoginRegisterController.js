
/// <reference path="~/ScriptsApp/main.js" />

(function (w, ko, $) {

    w.auth = w.auth || {};
    w.auth.LoginRegisterController = function (viewModel, element, va, ava) {
        var _this = this;
        var loginVm = viewModel.Login = {};

        loginVm.succesMessage = ko.observable();
        loginVm.failMessage = ko.observable();
        loginVm.email = ko.observable(ko.unwrap(ava().email));
        loginVm.password = ko.observable('');
        loginVm.forgotPassword = function () {
            loginVm.succesMessage('');
            loginVm.failMessage('');
            w.alertify.prompt(ep.res('Res.Login.PromptForEmail'), loginVm.email(), function (ok, str) {
                if (ok) {
                    $.getJSON('/Auth/RecoverPassword', { email: str }, function (r) {
                        if (r.success) loginVm.succesMessage(r.success);
                        else if (r.fail) loginVm.failMessage(r.fail);
                    });
                }
            });
        };


        var registerVm = viewModel.Register = {};
        registerVm.email = ko.observable('');
        registerVm.password = ko.observable('');
        registerVm.passwordConfirm = ko.observable('');
        registerVm.displayName = ko.observable('');


    };


}(window, window.ko, window.$));