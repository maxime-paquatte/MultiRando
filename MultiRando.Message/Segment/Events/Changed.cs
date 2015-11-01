using Neva.Messaging;

namespace MultiRando.Message.Segment.Events
{
    public class Changed : IEvent
    {
        public string Source { get; set; }

        public string SegmentId { get; set; }
    }
}
