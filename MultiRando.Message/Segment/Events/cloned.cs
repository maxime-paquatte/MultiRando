using Neva.Messaging;

namespace MultiRando.Message.Segment.Events
{
    public class Cloned : IEvent
    {
        public string Source { get; set; }

        public string SegmentId { get; set; }
        public string NewSegmentId { get; set; }
    }
}
