using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using MultiRando.Web.Core;
using Nancy;
using Nancy.Responses;
using Neva.Messaging;
using Neva.Messaging.Impl;
using Neva.Resource.Model;
using NevaUtils.StdServices;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace MultiRando.Web.Modules
{
    public class MessagingModule : NancyModule
    {

        public MessagingModule(Config cfg, IBus bus, IQueryJSonBus reader, IStore store, IResourceContext ctx, IExceptionLoggerService exceptionLoggerService)
        {
            Get["/query/{name}"] = _ =>
            {
                long exId = 0;
                try
                {
                    var t = store.ResolveMessageType(_["name"]);
                    if (t == null) throw new Exception("Query not found : " + _["name"]);
                    var q = (IQuery)Activator.CreateInstance(t);
                    NevaUtils.ObjectHelper.FillFromString(q, n => Request.Query[n]);

                    MethodInfo method = typeof(IQueryJSonBus).GetMethod("Read");
                    MethodInfo generic = method.MakeGenericMethod(t);
                    var json = (string)generic.Invoke(reader, new object[] { q });

                    return Response.AsText(json, "application/json");
                }
                catch (Exception ex)
                {
                    exId = exceptionLoggerService.Log(new Exception("Unable to read query : " + _["name"], ex));
                }
                return Response.AsJson(new { ExceptionId = exId.ToString(CultureInfo.InvariantCulture) });
            };

            Post["/command/{name}"] = _ =>
            {
                long exId = 0;
                string cmdId = null;
                try
                {
                    var t = store.ResolveMessageType(_.name);
                    if (t == null) throw new Exception("Command not found : " + _["name"]);
                    var c = (ICommand)Activator.CreateInstance(t);

                    //var ci = ctx.CurrentCultureId == 12
                    //    ? new System.Globalization.CultureInfo("fr-FR")
                    //    : new System.Globalization.CultureInfo("en-GB");
                    var ci = CultureInfo.InvariantCulture;
                    NevaUtils.ObjectHelper.FillFromString(c, n => Request.Form[n], ci);

                    var eWrapper = new EventDispatcherWrapper(bus);

                    MethodInfo method =
                        typeof(IBus).GetMethods().SingleOrDefault(m => m.Name == "Send" && m.GetParameters().Count() == 2);
                    System.Diagnostics.Debug.Assert(method != null, "IBus should contains Send methode with 2 parameters");
                    MethodInfo generic = method.MakeGenericMethod(t);
                    var r = (CommandResult)generic.Invoke(bus, new object[] { c, eWrapper });

                    cmdId = r.CommandId;
                    return Response.AsJson(new
                    {
                        ExceptionId = 0,
                        r.CommandId,
                        r.CommandValidationErrors,
                        Events = eWrapper.Events.Select(e => new { Name = e.GetType().FullName, Payload = e }).ToArray()
                    });
                }
                catch (Exception ex)
                {
                    if (ex.InnerException is UnauthorizedAccessException)
                        return new HtmlResponse(HttpStatusCode.Forbidden);
                    exId = exceptionLoggerService.Log(new Exception("Unable to execute command : " + _["name"], ex));
                }

                return Response.AsJson(new { cmdId, ExceptionId = exId.ToString(CultureInfo.InvariantCulture) });
            };
        }


    }
}
