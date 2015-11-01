using Neva.Messaging;

namespace MultiRando.Message.Segment.Commands
{
    public class Update : ICommand
    {
        public int SegmentId { get; set; }

        public string Name { get; set; }
        public string Comment { get; set; }
        public bool IsPublic { get; set; }
    }
}
