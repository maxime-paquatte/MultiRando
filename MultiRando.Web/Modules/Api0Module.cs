using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MultiRando.Model.Route;
using MultiRando.Model.Segment;
using MultiRando.Model.User;
using MultiRando.Web.Core;
using MultiRando.Web.Core.Helpers;
using MultiRando.Web.Core.Services;
using Nancy;
using Nancy.Authentication.Forms;
using NevaUtils;

namespace MultiRando.Web.Modules
{
    public class Api0Module : NancyModule
    {

        public Api0Module(UserRepository userRepository, RouteRepository routeRepository)
            :base("/api0/")
        {
            Get["/auth"] = _ =>
            {
                var u = userRepository.GetUser((string)Request.Query.email);
                if (u != null && PasswordHash.ValidatePassword(Request.Query.password, u.Passwd))
                {
                    string apiKey = Security.Md5Hash64("741f7eaa-10c8-4f9f-ad0a-97b00d2de418", u.Email);
                    userRepository.SetApiKey(u.UserId, apiKey);
                    return Response.AsJson(new { result = "success", apiKey });
                }
                return Response.AsJson(new { result = "error", message = "UserNotFound"});
            };
            Get["/UserRoutes/"] = _ =>
            {
                
                var u = userRepository.GetUserByApiKey((string)Request.Query.apiKey);
                if (u != null)
                {
                    long ts = long.TryParse((string) Request.Query.ts ?? "", out ts) ? ts : 0;

                    var routes = routeRepository.RoutesForUser(u.UserId, ts).ToArray();
                    return Response.AsJson(new { result = "success", routes });
                }
                return Response.AsJson(new { result = "error", message = "InvalidApiKey" });
            };

        }
    }
}
