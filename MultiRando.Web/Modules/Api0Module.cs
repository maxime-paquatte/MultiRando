using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MultiRando.Model.Route;
using MultiRando.Web.Core;
using MultiRando.Web.Core.Helpers;
using MultiRando.Web.Core.Services;
using Nancy;

namespace MultiRando.Web.Modules
{
    public class Api0Module : NancyModule
    {

        public Api0Module(RouteRepository routeRepository)
            :base("/api0/")
        {
            Get["/route/{id}"] = _ =>
            {
                var poly = routeRepository.GetPolygon((int)_.id);
                return Response.AsText(string.Join(Environment.NewLine, poly.Select(p=>p.Item1 + " " + p.Item2)), "text/plain");
            };
        }
    }
}
