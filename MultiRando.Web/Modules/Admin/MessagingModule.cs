using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MultiRando.Web.Core;
using Nancy;
using Neva.Messaging;

namespace MultiRando.Web.Modules.Admin
{
    public class MessagingModule : NancyModule
    {

        public MessagingModule(Config cfg, IStore store)
            : base("/Admin/Messaging")
        {
            
            Get["/"] = _ => View["Admin/Messaging/Index"];
            Get["/Messages"] = _ => Response.AsJson(new { store.Messages });
            Get["/Message/{message}/"] = _ =>
            {
                Type t = store.ResolveMessageType(_.message);
                string kind = "other";
                if (typeof(Neva.Messaging.IQuery).IsAssignableFrom(t)) kind = "Query";
                if (typeof(Neva.Messaging.ICommand).IsAssignableFrom(t)) kind = "Command";
                if (typeof(Neva.Messaging.IEvent).IsAssignableFrom(t)) kind = "Event";

                return Response.AsJson(new
                {
                    Name = _.message,
                    Kind = kind,
                    Properties = t.GetProperties().Select(p => new
                    {
                        p.Name,
                        p.PropertyType,
                        IsXml = p.GetCustomAttributes(typeof(XmlAttribute), false).Length > 0
                    })
                });
            };
        }


    }
}
