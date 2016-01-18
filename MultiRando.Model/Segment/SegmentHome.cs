using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CK.Setup;
using CK.Setup.SqlServer;
using MultiRando.Message.Segment.Commands;
using MultiRando.Message.Segment.Queries;
using MultiRando.Model.User;
using Neva.Messaging;
using Neva.Messaging.Sql;
using NevaUtils;

namespace MultiRando.Model.Segment
{
    [SqlTable("tSegment", Package = typeof(Package), ResourcePath = "Segment.Res"), Versions("5.7.11")]
    [SqlObjectItem("svSegmentGetInBound")]
    [SqlObjectItem("scSegmentSetPolyline,scSegmentDelete,scSegmentUpdate,scSegmentClone")]
    public class SegmentHome : SqlTable
    {
        void Construct(UserHome user) { }
    }


    public class CommandHandler : SqlCommandHandlerBase,  ICommandHandler<Delete>, 
        ICommandHandler<SetPolyline>, ICommandHandler<Update>, ICommandHandler<Clone>
    {
        public CommandHandler(IDbConfig config, IBus bus)
            : base(bus, config.ConnectionString)
        {
        }
        

        public void Handle(IEventDispatcher d, IMessageContext context, string commandId, SetPolyline command)
        {
            Handle(d, context, commandId, command, "MR.scSegmentSetPolyline");
        }

        public void Handle(IEventDispatcher d, IMessageContext context, string commandId, Delete command)
        {
            Handle(d, context, commandId, command, "MR.scSegmentDelete");
        }

        public void Handle(IEventDispatcher d, IMessageContext context, string commandId, Update command)
        {
            Handle(d, context, commandId, command, "MR.scSegmentUpdate");
        }
        public void Handle(IEventDispatcher d, IMessageContext context, string commandId, Clone command)
        {
            Handle(d, context, commandId, command, "MR.scSegmentClone");
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
            return Read(context, query, "MR.svSegmentGetInBound");
        }
    }
}
