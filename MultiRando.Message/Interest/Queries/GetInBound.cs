using Neva.Messaging;

namespace MultiRando.Message.Interest.Queries
{
    public class GetInBound : IQuery
    {
        public decimal NorthEastLat { get; set; }
        public decimal NorthEastLng { get; set; }

        public decimal SouthWestLat { get; set; }
        public decimal SouthWestLng { get; set; }
    }
}
