using Neva.Messaging;

namespace MultiRando.Message.Interest.Commands
{
    public class Move : ICommand
    {
        public int InterestId { get; set; }
        public decimal Lat { get; set; }
        public decimal Lon { get; set; }
    }
}
