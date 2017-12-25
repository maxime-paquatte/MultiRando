using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NevaUtils;
using PetaPoco;

namespace MultiRando.Model.Route
{
    public class RouteRepository
    {
        private readonly IDbConfig _config;

        public RouteRepository(IDbConfig config)
        {
            _config = config;
        }

        public IEnumerable<Route> RoutesForUser(int userId, long ts)
        {
            var db = new Database(_config.ConnectionString, "System.Data.SqlClient");
            return db.Query<Route>(@"select v.* from MR.vRoute v inner join MR.tRoute r on r.RouteId = v.RouteId where v.CreatorUserId = @0 and r.timestamp > @1", userId, ts);
        }

        public Route ById(int routeId)
        {
            var db = new Database(_config.ConnectionString, "System.Data.SqlClient");
            return db.SingleOrDefault<Route>(@"select * from MR.vRoute  where RouteId= @0", routeId);
        }

        public IEnumerable<Point> RoutesPoints(int routeId)
        {

            var db = new Database(_config.ConnectionString, "System.Data.SqlClient");
            var routeline = db.ExecuteScalar<string>(@"select r.LineString from MR.vRoute r where r.RouteId = @0", routeId);
            
            foreach (var s in routeline.Split(new [] {','}, StringSplitOptions.RemoveEmptyEntries))
            {
                var parts = s.Split(new[] {' '}, StringSplitOptions.RemoveEmptyEntries);
                yield return new Point() { Lat = double.Parse(parts[1], CultureInfo.InvariantCulture), Lon = double.Parse(parts[0], CultureInfo.InvariantCulture) };
            }
        }
    }


    public class Route
    {
        public int RouteId { get; set; }
        public int CreatorUserId { get; set; }

        public string Name { get; set; }
        public string CreatorDisplayName { get; set; }

        public int ActivityFlag { get; set; }

        public int RouteLength { get; set; }

        public bool IsPublic { get; set; }

        public DateTime Creationdate { get; set; }

        public long Timestamp { get; set; }
        public string LineString { get; set; }

        public long CreationDateEpoch => (long)Creationdate.ToUniversalTime().Subtract(
            new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            ).TotalMilliseconds;
    }
}
