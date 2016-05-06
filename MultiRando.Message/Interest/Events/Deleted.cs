using Neva.Messaging;

namespace MultiRando.Message.Interest.Events
{
    public class Deleted : IEvent
    {
        public string Source { get; set; }

        public string InterestId { get; set; }
    }
}
