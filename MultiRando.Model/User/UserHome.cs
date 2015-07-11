using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CK.Setup;
using CK.Setup.SqlServer;
using Neva.Messaging;
using Neva.Messaging.Sql;
using NevaUtils;

namespace MultiRando.Model.User
{
    [SqlTable("tUser", Package = typeof(Package), ResourcePath = "User.Res"), Versions("5.7.11")]
    [SqlObjectItem("")]
    public class UserHome : SqlTable
    {
        void Construct() { }
    }


    public class CommandHandler : SqlCommandHandlerBase//, ICommandHandler<Register>
    {
        public CommandHandler(IDbConfig config, IBus bus)
            : base(bus, config.ConnectionString)
        {
        }

        //public void Handle(IEventDispatcher d, IMessageContext context, string commandId, AdminUpdate command)
        //{
        //    Handle(d, context, commandId, command, "Ep.scUserAdminUpdate");
        //}

    }

    public class QueryReader : SqlQueryJSonReader//, IQueryJSonReader<ConnectionLogActor>
    {
        public QueryReader(IDbConfig config)
            : base(config.ConnectionString)
        {
        }

        //public string Read(IMessageContext context, ConnectionLogActor query)
        //{
        //    return Read(context, query, "Ep.svUserConnectionLogActor");
        //}
    }
}
