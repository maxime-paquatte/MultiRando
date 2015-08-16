using Neva.Messaging;

namespace MultiRando.Message.Route.Commands
{
    public class SetPolyline : ICommand
    {
        public int RouteId { get; set; }

        public string Polygon { get; set; }
    }
}
