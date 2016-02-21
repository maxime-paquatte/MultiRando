using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MultiRando.Model.User;
using MultiRando.Web.Core;
using MultiRando.Web.Core.Services;
using Nancy;
using Nancy.Authentication.Forms;
using Nancy.Helpers;
using Nancy.SimpleAuthentication;
using NevaUtils;
using NevaUtils.StdServices;

namespace MultiRando.Web.Modules
{
    public class AuthModule : NancyModule, IAuthenticationCallbackProvider
    {
        private const string FallbackRedirectUrl = "/map";

        private readonly UserRepository _userRepository;
        private readonly IMailingService _mailingService;
        private readonly IResourcesTemplateService _resourcesTemplateService;

        public AuthModule(UserRepository userRepository, IMailingService mailingService, IResourcesTemplateService resourcesTemplateService)
        {
            _userRepository = userRepository;
            _mailingService = mailingService;
            _resourcesTemplateService = resourcesTemplateService;
            Get["/Auth/Login"] = x => View["Login"];
            Post["/Auth/Login"] = Login;

            Get["/Auth/Register"] = x => View["Login", new { IsRegister = true}];
            Post["/Auth/Register"] = Register;

            Get["/Auth/RecoverPassword"] = RecoverPassword;
            Get["/Auth/AskPassword"] = AskPassword;
            Post["/Auth/ChangePassword"] = ChangePassword;
        }

        dynamic Register(dynamic x)
        {
            if (_userRepository.EmailExists(Request.Form.email))
                return View["Login", new { IsRegister = true, RegisterErrorResMessage = "Res.Register.Messages.EmailExists" }];

            var hash = PasswordHash.CreateHash(Request.Form.password);
            Guid userId = _userRepository.CreateUser(Request.Form.email, Request.Form.displayName, hash);
            return this.LoginAndRedirect(userId, fallbackRedirectUrl: FallbackRedirectUrl);

        }

        dynamic Login(dynamic x)
        {
            var u = _userRepository.GetUser((string)Request.Form.email);
            if (u != null) { 
                if (PasswordHash.ValidatePassword(Request.Form.password, u.Passwd))
                    return this.LoginAndRedirect(u.AuthId, fallbackRedirectUrl: FallbackRedirectUrl);
            }

            return View["Login", new { Email = Request.Form.email, IsRegister = false, LoginErrorResMessage = "Res.Login.Messages.BadLogin" }];
        }

        dynamic RecoverPassword(dynamic x)
        {
            var email = Request.Query.email;

            if (!_userRepository.EmailExists(email))
                return Response.AsJson(new { Fail = _resourcesTemplateService.GetRes("Res.Auth.RecoverPassword.EmailNotFound") });

            var t = MailingService.GetCryption().SerializeObject(new string[] { DateTime.UtcNow.ToString("O"), email });
            var link = Config.Current.MailingRootUrl.TrimEnd('/') + "/Auth/AskPassword?token=" + HttpUtility.UrlEncode(t);

            var p = new MailParam
            {
                Subject = _resourcesTemplateService.GetRes("Res.Mail.RecoverPassword.Subject"),
                ContentText = _resourcesTemplateService.GetRes("Res.Mail.RecoverPassword.ContentText", new { Link = link })
            };


            if (_mailingService.Send(p, email))
                return Response.AsJson(new { Success = _resourcesTemplateService.GetRes("Res.Auth.RecoverPassword.Sent") });

            return Response.AsJson(new { Fail = _resourcesTemplateService.GetRes("Res.Auth.RecoverPassword.SendingError") });
        }

        dynamic AskPassword(dynamic x)
        {
            string[] t = null;
            try { t = MailingService.GetCryption().DeserializeObject<string[]>((string)Request.Query.token); }
            catch{ }

            if (t == null || t.Length != 2 || DateTime.Parse(t[0]) < DateTime.UtcNow.AddDays(-1))
                return View["Login", new { IsRegister = false, LoginErrorResMessage = "Res.Login.Messages.InvalidToken" }];

            return View["AskPassword", new { Token = (string)Request.Query.token }];

        }

        dynamic ChangePassword(dynamic x)
        {
            if(string.IsNullOrEmpty(Request.Form.password))
                return View["AskPassword", new { Token = (string)Request.Form.token, LoginErrorResMessage = "Res.AskPassword.Messages.EmptyPassword" }];
            if (Request.Form.password != Request.Form.passwordConfirm)
                return View["AskPassword", new { Token = (string)Request.Form.token, LoginErrorResMessage = "Res.AskPassword.Messages.DifferentPassword" }];
       
            string[] t = null;
            try { t = MailingService.GetCryption().DeserializeObject<string[]>((string)Request.Form.token); }
            catch{ }

            if (t == null || t.Length != 2 || DateTime.Parse(t[0]) < DateTime.UtcNow.AddDays(-1))
                return View["Login", new { IsRegister = false, LoginErrorResMessage = "Res.Login.Messages.InvalidToken" }];


            var email = t[1];
            var hash = PasswordHash.CreateHash(Request.Form.password);
            _userRepository.SetPassword(email, hash);

            Guid authId = _userRepository.GetAuthId(email);
            return this.LoginAndRedirect(authId, fallbackRedirectUrl: FallbackRedirectUrl);
        }

        dynamic IAuthenticationCallbackProvider.OnRedirectToAuthenticationProviderError(NancyModule nancyModule, string errorMessage)
        {
            throw new NotImplementedException();
        }

        dynamic IAuthenticationCallbackProvider.Process(NancyModule nancyModule, AuthenticateCallbackData model)
        {
            throw new NotImplementedException();
        }

    }


}
