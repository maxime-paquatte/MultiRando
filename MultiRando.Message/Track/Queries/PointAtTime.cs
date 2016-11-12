using Neva.Messaging;

namespace MultiRando.Message.Track.Queries
{
    public class PointAtTime : IQuery
    {
        public int TrackId { get; set; }

        public int NbSeconds { get; set; }
    }
}
