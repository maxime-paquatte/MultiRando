using CK.Setup;
using CK.Setup.SqlServer;
using MultiRando.Message.Track.Commands;
using MultiRando.Message.Track.Queries;
using MultiRando.Model.User;
using Neva.Messaging;
using Neva.Messaging.Sql;
using NevaUtils;

namespace MultiRando.Model.Track
{
    [SqlTable("tTrack", Package = typeof(Package), ResourcePath = "Track.Res"), Versions("5.7.11")]
    [SqlObjectItem("vGpxLineString,svTrackForActor,svTrackLine,svTrackById,svTrackPointAtTime,svTrackTimeAtPoint")]
    [SqlObjectItem("scTrackDelete,scTrackRename")]
    public class TrackHome : SqlTable
    {
        void Construct(UserHome user) { }
    }


    public class CommandHandler : SqlCommandHandlerBase, ICommandHandler<Delete>, ICommandHandler<Rename>
    {
        public CommandHandler(IDbConfig config, IBus bus)
            : base(bus, config.ConnectionString)
        {
        }

        public void Handle(IEventDispatcher d, IMessageContext context, string commandId, Delete command)
        {
            Handle(d, context, commandId, command, "MR.scTrackDelete");
        }

        public void Handle(IEventDispatcher d, IMessageContext context, string commandId, Rename command)
        {
            Handle(d, context, commandId, command, "MR.scTrackRename");
        }
    }

    public class QueryReader : SqlQueryJSonReader, IQueryJSonReader<ForActor>, IQueryJSonReader<Line>
        , IQueryJSonReader<ById>, IQueryJSonReader<PointAtTime>, IQueryJSonReader<TimeAtPoint>
    {
        public QueryReader(IDbConfig config)
            : base(config.ConnectionString)
        {
        }

        public string Read(IMessageContext context, ForActor query)
        {
            return Read(context, query, "MR.svTrackForActor");
        }

        public string Read(IMessageContext context, Line query)
        {
            return Read(context, query, "MR.svTrackLine");
        }
        public string Read(IMessageContext context, ById query)
        {
            return Read(context, query, "MR.svTrackById");
        }

        public string Read(IMessageContext context, PointAtTime query)
        {
            return Read(context, query, "MR.svTrackPointAtTime");
        }

        public string Read(IMessageContext context, TimeAtPoint query)
        {
            return Read(context, query, "MR.svTrackTimeAtPoint");
        }
    }
}
