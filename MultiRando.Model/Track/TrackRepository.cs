using System;
using System.Collections.Generic;
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

        public int CreateGpx(int userId, string name, string data)
        {
            var db = new Database(_config.ConnectionString, "System.Data.SqlClient");
            return db.ExecuteScalar<int>("insert into [MR].[tTrack] ([UserId],[Name],[Gpx]) VALUES(@0, @1, @2); select SCOPE_IDENTITY();", userId, name, data);
        }

    }
}
