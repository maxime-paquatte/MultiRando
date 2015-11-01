using Neva.Messaging;

namespace MultiRando.Message.Segment.Commands
{
    public class Create : ICommand
    {
        public string Name { get; set; }
    }
}
