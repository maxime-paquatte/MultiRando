using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Cassette.Owin;
using Microsoft.Owin;
using Microsoft.Owin.Extensions;
using Owin;

namespace MultiRando.Web
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.Use<Middleware>();
            app.UseCassette();
            app.UseStaticFiles();

            app.UseNancy();

            app.UseStageMarker(PipelineStage.MapHandler);


        }

    }
    public class Middleware : OwinMiddleware
    {
        public Middleware(OwinMiddleware next) : base(next) { }


        public override async Task Invoke(IOwinContext context)
        {
            await Next.Invoke(context);
        }
    }


}
