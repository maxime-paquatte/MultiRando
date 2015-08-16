using Neva.Messaging;

namespace MultiRando.Message.Route.Queries
{
    public class GetPolyline : IQuery
    {
        public int RouteId { get; set; }
    }
}
