using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CK.Setup;
using CK.Setup.SqlServer;
using MultiRando.Message.Interest.Commands;
using MultiRando.Message.Interest.Queries;
using MultiRando.Model.User;
using Neva.Messaging;
using Neva.Messaging.Sql;
using NevaUtils;

namespace MultiRando.Model.Interest
{
    [SqlTable("tInterest", Package = typeof(Package), ResourcePath = "Interest.Res"), Versions("5.7.11")]
    [SqlObjectItem("scInterestCreate,scInterestMove,scInterestDelete,scInterestUpdate,scInterestAddMedia")]
    [SqlObjectItem("svInterestGetInBound,svInterestMedias")]
    public class InterestHome : SqlTable
    {
        void Construct(UserHome user) { }
    }


    public class CommandHandler : SqlCommandHandlerBase, ICommandHandler<Create>, ICommandHandler<Move>
        , ICommandHandler<Delete>, ICommandHandler<Update>, ICommandHandler<AddMedia>
    {
        public CommandHandler(IDbConfig config, IBus bus)
            : base(bus, config.ConnectionString)
        {
        }

        public void Handle(IEventDispatcher d, IMessageContext context, string commandId, Create command)
        {
            Handle(d, context, commandId, command, "MR.scInterestCreate");
        }

        public void Handle(IEventDispatcher d, IMessageContext context, string commandId, Move command)
        {
            Handle(d, context, commandId, command, "MR.scInterestMove");
        }

        public void Handle(IEventDispatcher d, IMessageContext context, string commandId, Delete command)
        {
            Handle(d, context, commandId, command, "MR.scInterestDelete");
        }

        public void Handle(IEventDispatcher d, IMessageContext context, string commandId, Update command)
        {
            Handle(d, context, commandId, command, "MR.scInterestUpdate");
        }

        public void Handle(IEventDispatcher d, IMessageContext context, string commandId, AddMedia command)
        {
            Handle(d, context, commandId, command, "MR.scInterestAddMedia");
        }
    }

    public class QueryReader : SqlQueryJSonReader, IQueryJSonReader<GetInBound>, IQueryJSonReader<Medias>
    {
        public QueryReader(IDbConfig config)
            : base(config.ConnectionString)
        {
        }

        public string Read(IMessageContext context, GetInBound query)
        {
            return Read(context, query, "MR.svInterestGetInBound");
        }

        public string Read(IMessageContext context, Medias query)
        {
            return Read(context, query, "MR.svInterestMedias");
        }
    }
}
