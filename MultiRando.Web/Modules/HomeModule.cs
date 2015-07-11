using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MultiRando.Web.Core;
using MultiRando.Web.Core.Helpers;
using MultiRando.Web.Core.Services;
using Nancy;

namespace MultiRando.Web.Modules
{
    public class HomeModule : NancyModule
    {

        public HomeModule(Config cfg)
        {
            Get["/"] = x => View["Index"];
            Get["/Home/ExceptionDetails"] = _ =>
            {
                //this.RequiresAnyClaim(new []{"Claim.System.ExceptionLog.View"});
                return Response.AsText(ExceptionLoggerService.GetLog(cfg.AppPath, long.Parse((string)Request.Query["exceptionId"])), "text/xml");
            };

            Get["/Resource/GetRes"] = _ =>
            {
                var res = (string)Request.Query.resName;
                if (string.IsNullOrEmpty(res)) return string.Empty;
                return Response.AsText(Context.Res(res), "text/plain");
            };
        }
    }
}
