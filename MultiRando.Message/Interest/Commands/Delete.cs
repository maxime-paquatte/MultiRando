using Neva.Messaging;

namespace MultiRando.Message.Interest.Commands
{
    public class Delete : ICommand
    {
        public int InterestId { get; set; }
    }
}
