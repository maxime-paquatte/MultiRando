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
    [SqlObjectItem("svInterestGetInBound")]
    [SqlObjectItem("scInterestUpdateOrCreate")]
    public class InterestHome : SqlTable
    {
        void Construct(UserHome user) { }
    }


    public class CommandHandler : SqlCommandHandlerBase, ICommandHandler<UpdateOrCreate>
    {
        public CommandHandler(IDbConfig config, IBus bus)
            : base(bus, config.ConnectionString)
        {
        }

        public void Handle(IEventDispatcher d, IMessageContext context, string commandId, UpdateOrCreate command)
        {
            Handle(d, context, commandId, command, "MR.scInterestUpdateOrCreate");
        }

    }

    public class QueryReader : SqlQueryJSonReader, IQueryJSonReader<GetInBound>
    {
        public QueryReader(IDbConfig config)
            : base(config.ConnectionString)
        {
        }

        public string Read(IMessageContext context, GetInBound query)
        {
            return Read(context, query, "MR.svInterestGetInBound");
        }
    }
}
