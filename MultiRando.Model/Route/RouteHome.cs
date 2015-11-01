using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CK.Setup;
using CK.Setup.SqlServer;
using MultiRando.Message.Route.Commands;
using MultiRando.Message.Route.Queries;
using MultiRando.Model.User;
using Neva.Messaging;
using Neva.Messaging.Sql;
using NevaUtils;

namespace MultiRando.Model.Route
{
    [SqlTable("tRoute", Package = typeof(Package), ResourcePath = "Route.Res"), Versions("5.7.11")]
    [SqlObjectItem("svRouteGetPage,svRouteGetPolyline")]
    [SqlObjectItem("scRouteCreate,scRouteSetPolyline,scRouteDelete,scRouteUpdate")]
    public class RouteHome : SqlTable
    {
        void Construct(UserHome user) { }
    }


    public class CommandHandler : SqlCommandHandlerBase, ICommandHandler<Create>, ICommandHandler<Delete>, ICommandHandler<SetPolyline>, ICommandHandler<Update>
    {
        public CommandHandler(IDbConfig config, IBus bus)
            : base(bus, config.ConnectionString)
        {
        }

        public void Handle(IEventDispatcher d, IMessageContext context, string commandId, Create command)
        {
            Handle(d, context, commandId, command, "MR.scRouteCreate");
        }

        public void Handle(IEventDispatcher d, IMessageContext context, string commandId, SetPolyline command)
        {
            Handle(d, context, commandId, command, "MR.scRouteSetPolyline");
        }

        public void Handle(IEventDispatcher d, IMessageContext context, string commandId, Delete command)
        {
            Handle(d, context, commandId, command, "MR.scRouteDelete");
        }

        public void Handle(IEventDispatcher d, IMessageContext context, string commandId, Update command)
        {
            Handle(d, context, commandId, command, "MR.scRouteUpdate");
        }
    }

    public class QueryReader : SqlQueryJSonReader, IQueryJSonReader<GetPage>, IQueryJSonReader<GetPolyline>
    {
        public QueryReader(IDbConfig config)
            : base(config.ConnectionString)
        {
        }

        public string Read(IMessageContext context, GetPage query)
        {
            return Read(context, query, "MR.svRouteGetPage");
        }

        public string Read(IMessageContext context, GetPolyline query)
        {
            return Read(context, query, "MR.svRouteGetPolyline");
        }
    }
}
