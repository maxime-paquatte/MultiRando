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
    [SqlTable("tRoute", Package = typeof(Package), ResourcePath = "Route.Res"), Versions("6.2.16")]
    [SqlObjectItem("vRoute,svRouteForActor,svRouteLine")]
    [SqlObjectItem("scRouteUpdateOrCreate,scRouteRename,scRouteDelete")]
    public class RouteHome : SqlTable
    {
        void Construct(UserHome user) { }
    }


    public class CommandHandler : SqlCommandHandlerBase, ICommandHandler<UpdateOrCreate>, ICommandHandler<Rename>, ICommandHandler<Delete>
    {
        public CommandHandler(IDbConfig config, IBus bus)
            : base(bus, config.ConnectionString)
        {
        }

        public void Handle(IEventDispatcher d, IMessageContext context, string commandId, UpdateOrCreate command)
        {
            Handle(d, context, commandId, command, "MR.scRouteUpdateOrCreate");
        }

        public void Handle(IEventDispatcher d, IMessageContext context, string commandId, Rename command)
        {
            Handle(d, context, commandId, command, "MR.scRouteRename");
        }

        public void Handle(IEventDispatcher d, IMessageContext context, string commandId, Delete command)
        {
            Handle(d, context, commandId, command, "MR.scRouteDelete");
        }
    }

    public class QueryReader : SqlQueryJSonReader, IQueryJSonReader<ForActor>, IQueryJSonReader<Line>
    {
        public QueryReader(IDbConfig config)
            : base(config.ConnectionString)
        {
        }

        public string Read(IMessageContext context, ForActor query)
        {
            return Read(context, query, "MR.svRouteForActor");
        }

        public string Read(IMessageContext context, Line query)
        {
            return Read(context, query, "MR.svRouteLine");
        }
    }
}
