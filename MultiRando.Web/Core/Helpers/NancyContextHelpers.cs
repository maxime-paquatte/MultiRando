using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Nancy;
using Nancy.TinyIoc;

namespace MultiRando.Web.Core.Helpers
{
    public static class NancyContextHelpers
    {
        public static string Res(this NancyContext ctx, string resName, object templateValues = null)
        {
            var ioc = ctx.Items["TinyIoCContainer"] as TinyIoCContainer;
            if (ioc == null) throw new InvalidOperationException("Unable to get TinyIoCContainer from NancyContext items");

            var service = ioc.Resolve<NevaUtils.StdServices.IResourcesTemplateService>();
            if (service == null) throw new InvalidOperationException("Unable to resovle IResourcesService");

            return templateValues == null ? service.GetRes(resName) : service.GetRes(resName, templateValues);
        }
    }
}
