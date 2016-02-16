using Neva.Messaging;

namespace MultiRando.Message.Track.Commands
{
    public class Delete : ICommand
    {
        public int TrackId { get; set; }
    }
}
