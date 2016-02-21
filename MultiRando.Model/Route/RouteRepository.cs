using System;
using System.Collections.Generic;
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

        public IEnumerable<Route> RoutesForUser(int userId)
        {
            var db = new Database(_config.ConnectionString, "System.Data.SqlClient");
            return db.Query<Route>(@"select r.*, CreatorDisplayName = u.DisplayName
                        from MR.tRoute r inner join MR.tUser u on u.UserId = r.CreatorUserId  
                        where r.CreatorUserId = @0", userId);
        }

        public string RoutesLine(int routeId)
        {
            var db = new Database(_config.ConnectionString, "System.Data.SqlClient");
            return db.ExecuteScalar<string>(@"select r.LineString.ToString() from MR.tRoute r where r.RouteId = @0", routeId);
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

        public long CreationDateEpoch => (long)Creationdate.ToUniversalTime().Subtract(
            new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            ).TotalMilliseconds;
    }
}
