using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Nancy;

namespace MultiRando.Web.Modules.Admin
{
    public class ResourcesModule : NancyModule
    {

        public ResourcesModule()
        {
            Get["/Admin/Resources/"] = _ => View["Admin/Resources/Index"];
        }


    }
}
