using Neva.Messaging;

namespace MultiRando.Message.Segment.Queries
{
    public class GetPolyline : IQuery
    {
        public int SegmentId { get; set; }
    }
}
