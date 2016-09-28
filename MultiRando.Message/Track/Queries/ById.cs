using Neva.Messaging;

namespace MultiRando.Message.Track.Queries
{
    public class ById : IQuery
    {
        public int TrackId { get; set; }
    }
}
