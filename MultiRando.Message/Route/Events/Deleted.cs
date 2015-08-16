using Neva.Messaging;

namespace MultiRando.Message.Route.Events
{
    public class Deleted : IEvent
    {
        public string Source { get; set; }

        public string RouteId { get; set; }
    }
}
