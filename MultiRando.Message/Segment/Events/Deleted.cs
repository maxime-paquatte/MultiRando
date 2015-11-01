using Neva.Messaging;

namespace MultiRando.Message.Segment.Events
{
    public class Deleted : IEvent
    {
        public string Source { get; set; }

        public string SegmentId { get; set; }
    }
}
