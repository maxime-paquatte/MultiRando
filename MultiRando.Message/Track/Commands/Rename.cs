using Neva.Messaging;

namespace MultiRando.Message.Track.Commands
{
    public class Rename : ICommand
    {
        public int TrackId { get; set; }

        public string Name { get; set; }
    }
}
