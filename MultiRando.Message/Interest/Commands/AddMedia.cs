using Neva.Messaging;

namespace MultiRando.Message.Interest.Commands
{
    public class AddMedia : ICommand
    {
        public int InterestId { get; set; }

        public string MediaType { get; set; }
        public string Value { get; set; }
    }
}
