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

        public IEnumerable<Tuple<string, string>> GetPolygon(int routeId)
        {
            var db = new Database(_config.ConnectionString, "System.Data.SqlClient");
            var str = db.SingleOrDefault<string>("select Polylines.ToString() from MR.tRoute where RouteId = @0 ", routeId);
            return str.Substring("MULTIPOINT (".Length).Replace("(", "").Replace(")", "").Split(',')
                .Select(s =>
                {
                    var p = s.Trim().Split(' ');
                    return Tuple.Create(p[1], p[0]);
                });
        }

    }
}
