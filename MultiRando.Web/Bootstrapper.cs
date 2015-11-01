using System;
using System.Collections.Generic;
using System.Configuration;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MultiRando.Web.Core;
using MultiRando.Web.Core.Auth;
using MultiRando.Web.Core.Messaging;
using Nancy;
using Nancy.Authentication.Forms;
using Nancy.Bootstrapper;
using Nancy.Session;
using Nancy.TinyIoc;
using Neva.Messaging;
using Neva.Messaging.Impl;
using Neva.Resource.Model;
using NevaUtils;
using NevaUtils.StdServices;

namespace MultiRando.Web
{
    public class Bootstrapper : DefaultNancyBootstrapper
    {
        private static IStore _store;

        protected override void ApplicationStartup(TinyIoCContainer container, IPipelines pipelines)
        {
            base.ApplicationStartup(container, pipelines);

            CookieBasedSessions.Enable(pipelines);
            FormsAuthentication.Enable(pipelines, new AuthenticationConfiguration(container));


            Config.Current.MailingRootUrl = ConfigurationManager.AppSettings["multiRando:mailing:RootUrl"];
            Config.Current.AppPath = container.Resolve<IRootPathProvider>().GetRootPath();


            
            Discoverer.Discover(_store);


            pipelines.BeforeRequest.AddItemToEndOfPipeline(ctx =>
            {
                var u = (ctx.CurrentUser as UserIdentity) ?? UserIdentity.GetAnonymous(ctx);
                container.Resolve<IUserIdentityProvider>().CurrentUser = u;
                ctx.Culture = CultureInfo.GetCultureInfo(u.CurrentCultureId == 12 ? "fr" : "en");
                return null;
            });
        }

        

        protected override void ConfigureApplicationContainer(TinyIoCContainer container)
        {
            base.ConfigureApplicationContainer(container);

            container.Register(Config.Current);
            container.Register<IDbConfig, Config>(Config.Current);
            container.Register<Neva.Resource.Model.IResDbConfig, Config>(Config.Current);

            container.Register<IResourcesTemplateService, Neva.Resource.Model.ResourcesService>();

            /////////////////Messaging
            container.Register<IBusLogger, BusLogger>();
            container.Register<IActivator, IoCActivator>();
            container.Register<IClaimsValidator, ClaimsValidator>();


            container.Register(_store = new Store(container.Resolve<IActivator>()));


            container.Register<IQueryJSonBus, QueryJSonReader>();
            container.Register<IBus, Bus>(); 

        }

        protected override void ConfigureRequestContainer(TinyIoCContainer container, NancyContext context)
        {
            base.ConfigureRequestContainer(container, context);
            context.Items["TinyIoCContainer"] = container;


            container.Register<IMessageContext, MessageContextWrapper>();
            container.Register<IResourceContext, ResourceContextWrapper>();
            container.Register<IUserIdentityProvider, UserIdentityProvider>();
        }
    }
}
