
/// <reference path="~/ScriptsApp/main.js" />

(function (w, ko, $) {

    w.auth = w.auth || {};
    w.auth.LoginRegisterController = function (viewModel, element, va, ava) {
        var _this = this;
        var loginVm = viewModel.Login = {};

        var lastEmail = ko.unwrap(ava().email) || localStorage.getItem("lastLoginEmail");

        loginVm.succesMessage = ko.observable();
        loginVm.failMessage = ko.observable();
        loginVm.email = ko.observable(lastEmail);
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

        var saveEmail = function(email) {
            localStorage.setItem("lastLoginEmail", email);
        };
        loginVm.email.subscribe(saveEmail);
        registerVm.email.subscribe(saveEmail);
    };


}(window, window.ko, window.$));