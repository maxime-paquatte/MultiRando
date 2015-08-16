using Neva.Messaging;

namespace MultiRando.Message.Route.Queries
{
    public class GetPage : IQuery
    {
        public int Skip { get; set; }
        public int Take { get; set; }
        public int Total { get; set; }
    }
}
