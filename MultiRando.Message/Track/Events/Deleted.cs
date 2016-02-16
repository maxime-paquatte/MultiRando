using Neva.Messaging;

namespace MultiRando.Message.Track.Events
{
    public class Deleted : IEvent
    {
        public string Source { get; set; }

        public string TrackId { get; set; }
    }
}
