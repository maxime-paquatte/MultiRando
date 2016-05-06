using Neva.Messaging;

namespace MultiRando.Message.Interest.Commands
{
    public class Create : ICommand
    {
        public string Category { get; set; }
        public decimal Lat { get; set; }
        public decimal Lon { get; set; }
    }
}
