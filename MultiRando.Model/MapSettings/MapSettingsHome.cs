using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CK.Setup;
using CK.Setup.SqlServer;
using MultiRando.Message.MapSettings.Commands;
using MultiRando.Message.MapSettings.Queries;
using Neva.Messaging;
using Neva.Messaging.Sql;
using NevaUtils;

namespace MultiRando.Model.MapSettings
{
    [SqlTable("tMapSettings", Package = typeof(Package), ResourcePath = "MapSettings.Res"), Versions("5.7.11")]
    [SqlObjectItem("svMapSettingsGet")]    
    [SqlObjectItem("scMapSettingsSet")]
    public class MapSettingsHome : SqlTable
    {
        void Construct() { }
    }


    public class CommandHandler : SqlCommandHandlerBase, ICommandHandler<Set>
    {
        public CommandHandler(IDbConfig config, IBus bus)
            : base(bus, config.ConnectionString)
        {
        }

        public void Handle(IEventDispatcher d, IMessageContext context, string commandId, Set command)
        {
            Handle(d, context, commandId, command, "MR.scMapSettingsSet");
        }

    }

    public class QueryReader : SqlQueryJSonReader, IQueryJSonReader<Get>
    {
        public QueryReader(IDbConfig config)
            : base(config.ConnectionString)
        {
        }

        public string Read(IMessageContext context, Get query)
        {
            return Read(context, query, "MR.svMapSettingsGet");
        }
    }
}
