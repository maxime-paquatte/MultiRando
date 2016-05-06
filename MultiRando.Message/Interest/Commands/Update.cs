
using Neva.Messaging;

namespace MultiRando.Message.Interest.Commands
{
    public class Update : ICommand
    {
        public int InterestId { get; set; }

        public string Comment { get; set; }
    }
}
