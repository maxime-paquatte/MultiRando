using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Nancy;
using Nancy.SimpleAuthentication;

namespace MultiRando.Web.Modules
{
    public class AuthModule : NancyModule, IAuthenticationCallbackProvider
    {

        public AuthModule()
        {
            Get["/Login"] = x => View["Login"];

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
