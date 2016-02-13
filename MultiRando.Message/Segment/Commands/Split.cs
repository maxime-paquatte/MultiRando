using Neva.Messaging;

namespace MultiRando.Message.Segment.Commands
{
    public class Split : ICommand
    {
        public int SegmentId { get; set; }

        public string PolylinesA { get; set; }
        public string PolylinesB { get; set; }
    }
}
