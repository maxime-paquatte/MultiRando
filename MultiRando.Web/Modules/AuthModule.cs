using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MultiRando.Model.User;
using Nancy;
using Nancy.Authentication.Forms;
using Nancy.SimpleAuthentication;
using NevaUtils;

namespace MultiRando.Web.Modules
{
    public class AuthModule : NancyModule, IAuthenticationCallbackProvider
    {
        private readonly UserRepository _userRepository;

        public AuthModule(UserRepository userRepository)
        {
            _userRepository = userRepository;
            Get["/Auth/Login"] = x => View["Login"];
            Post["/Auth/Login"] = Login;

            Get["/Auth/Register"] = x => View["Login", new { IsRegister = true, RegisterErrorResMessage =""}]; ;
            Post["/Auth/Register"] = Register;

        }

        dynamic Register(dynamic x)
        {
            if (_userRepository.EmailExists(Request.Form.email))
                return View["Login", new { IsRegister = true, RegisterErrorResMessage = "Res.Register.Messages.EmailExists" }];

            var hash = PasswordHash.CreateHash(Request.Form.password);
            Guid userId = _userRepository.CreateUser(Request.Form.email, hash);
            return this.LoginAndRedirect(userId);

        }

        dynamic Login(dynamic x)
        {

            var hash = PasswordHash.CreateHash(Request.Form.password);
            Guid authId = _userRepository.AuthUser(Request.Form.email, hash);
            if (Guid.Empty ==  authId)
                return View["Login", new { IsRegister = false, LoginErrorResMessage = "Res.Login.Messages.BadLogin" }];

            return this.LoginAndRedirect(authId);

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
