using Neva.Messaging;

namespace MultiRando.Message.Segment.Commands
{
    public class SetPolyline : ICommand
    {
        public int SegmentId { get; set; }
       
        public string Polylines { get; set; }
    }
}
