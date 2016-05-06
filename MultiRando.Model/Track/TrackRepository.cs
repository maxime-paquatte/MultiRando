using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NevaUtils;
using PetaPoco;

namespace MultiRando.Model.Track
{
    public class TrackRepository
    {
        private readonly IDbConfig _config;

        public TrackRepository(IDbConfig config)
        {
            _config = config;
        }

        public int CreateGpx(int userId, string name, string line)
        {
            var db = new Database(_config.ConnectionString, "System.Data.SqlClient");
            return db.ExecuteScalar<int>("insert into [MR].[tTrack] ([UserId],[Name], LineString) VALUES(@0, @1, @2); select SCOPE_IDENTITY();", userId, name, line);
        }

        public int CreatePlt(int userId, string name, string line)
        {
            var db = new Database(_config.ConnectionString, "System.Data.SqlClient");
            return db.ExecuteScalar<int>("insert into [MR].[tTrack] ([UserId],[Name], LineString) VALUES(@0, @1, @2); select SCOPE_IDENTITY();", userId, name, line);
        }

        public void SetPoints(int trackId, TrackPoint[] points)
        {
            var sb = new StringBuilder();
            for (int i = 0; i < points.Length; i++)
            {
                if (i % 1000 == 0)
                {
                    if(sb.Length>0) sb.Remove(sb.Length - 1, 1);
                    sb.AppendLine(";").AppendLine("insert into MR.tTrackPoint (TrackId, Idx, Lat, Lon, Elevation, PointTime) values ");
                }

                var p = points[i];
                sb.AppendLine().Append("(")
                    .Append(trackId).Append(",")
                    .Append(i).Append(",")
                    .Append(p.Lat.ToString(CultureInfo.InvariantCulture)).Append(",")
                    .Append(p.Lon.ToString(CultureInfo.InvariantCulture)).Append(",")
                    .Append(p.Elevation.ToString(CultureInfo.InvariantCulture)).Append(",")
                    .Append("'").Append(p.PointTime.ToString("o",CultureInfo.InvariantCulture)).Append("'")
                    .Append("),");

               
            }
            var sql = sb.ToString().TrimEnd(',');
            var db = new Database(_config.ConnectionString, "System.Data.SqlClient");

            try
            {
                db.Execute(sql);
            }
            catch (SqlException ex)
            {
                throw new Exception(sql, ex);
            }
        }

        public class TrackPoint
        {
            public float Lat { get; set; }
            public float Lon { get; set; }

            public float Elevation { get; set; }
            public DateTime PointTime { get; set; }
        }
    }
}
