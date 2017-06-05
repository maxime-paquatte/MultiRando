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
    public class TrackModule : NancyModule
    {

        public TrackModule(Config cfg)
        {
            Get["/Track"] = _ => View["Index"];
        }
    }
}
