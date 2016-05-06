using Neva.Messaging;

namespace MultiRando.Message.Interest.Events
{
    public class MediaAdded : IEvent
    {
        public string Source { get; set; }

        public int InterestId { get; set; }
        public int InterestMediaId { get; set; }
    }
}
