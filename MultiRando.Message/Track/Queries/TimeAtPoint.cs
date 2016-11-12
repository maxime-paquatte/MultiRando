using Neva.Messaging;

namespace MultiRando.Message.Track.Queries
{
    public class TimeAtPoint : IQuery
    {
        public int TrackId { get; set; }

        public decimal Lat { get; set; }
        public decimal Lon { get; set; }
    }
}
