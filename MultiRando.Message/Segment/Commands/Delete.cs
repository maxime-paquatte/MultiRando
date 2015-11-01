using Neva.Messaging;

namespace MultiRando.Message.Segment.Commands
{
    public class Delete : ICommand
    {
        public int SegmentId { get; set; }
    }
}
