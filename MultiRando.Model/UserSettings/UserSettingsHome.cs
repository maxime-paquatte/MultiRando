﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CK.Setup;
using CK.Setup.SqlServer;
using MultiRando.Message.UserSettings.Commands;
using MultiRando.Message.UserSettings.Queries;
using MultiRando.Model.User;
using Neva.Messaging;
using Neva.Messaging.Sql;
using NevaUtils;

namespace MultiRando.Model.UserSettings
{
    [SqlTable("tUserSettings", Package = typeof(Package), ResourcePath = "UserSettings.Res"), Versions("5.7.11")]
    [SqlObjectItem("svUserSettingsGet")]    
    [SqlObjectItem("scUserSettingsSetMap,scUserSettingsSetActivity")]
    public class UserSettingsHome : SqlTable
    {
        void Construct(UserHome user) { }
    }


    public class CommandHandler : SqlCommandHandlerBase, ICommandHandler<SetMap>, ICommandHandler<SetActivity>
    {
        public CommandHandler(IDbConfig config, IBus bus)
            : base(bus, config.ConnectionString)
        {
        }

        public void Handle(IEventDispatcher d, IMessageContext context, string commandId, SetMap command)
        {
            Handle(d, context, commandId, command, "MR.scUserSettingsSetMap");
        }

        public void Handle(IEventDispatcher d, IMessageContext context, string commandId, SetActivity command)
        {
            Handle(d, context, commandId, command, "MR.scUserSettingsSetActivity");
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
            return Read(context, query, "MR.svUserSettingsGet");
        }
    }
}
