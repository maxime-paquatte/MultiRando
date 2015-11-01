using Neva.Messaging;

namespace MultiRando.Message.Segment.Queries
{
    public class GetPage : IQuery
    {
        public int Skip { get; set; }
        public int Take { get; set; }
        public int Total { get; set; }
    }
}
