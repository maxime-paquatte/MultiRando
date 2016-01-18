using Neva.Messaging;

namespace MultiRando.Message.Segment.Commands
{
    public class Clone : ICommand
    {
        public int SegmentId { get; set; }
    }
}
