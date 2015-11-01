using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NevaUtils;
using PetaPoco;

namespace MultiRando.Model.Segment
{
    public class SegmentRepository
    {
        private readonly IDbConfig _config;

        public SegmentRepository(IDbConfig config)
        {
            _config = config;
        }

        public IEnumerable<Tuple<string, string>> GetPolygon(int segmentId)
        {
            var db = new Database(_config.ConnectionString, "System.Data.SqlClient");
            var str = db.SingleOrDefault<string>("select Polylines.ToString() from MR.tSegment where SegmentId = @0 ", segmentId);
            return str.Substring("MULTIPOINT (".Length).Replace("(", "").Replace(")", "").Split(',')
                .Select(s =>
                {
                    var p = s.Trim().Split(' ');
                    return Tuple.Create(p[1], p[0]);
                });
        }

    }
}
