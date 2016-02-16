using Neva.Messaging;

namespace MultiRando.Message.Track.Events
{
    public class Changed : IEvent
    {
        public string Source { get; set; }

        public string TrackId { get; set; }
    }
}
