﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NevaUtils;
using PetaPoco;

namespace MultiRando.Model.User
{
    public class UserRepository
    {
        private readonly IDbConfig _config;

        public UserRepository(IDbConfig config)
        {
            _config = config;
        }

        public Guid CreateUser(string email, string displayName, string passwordHash)
        {
            var db = new Database(_config.ConnectionString, "System.Data.SqlClient");
            var userId = (int)db.Insert("MR.tUser", "UserId", true, new
            {
                Email = email,
                Passwd = passwordHash,
                DisplayName = displayName,
                PasswdLastChange = DateTime.UtcNow
            });

            return db.Single<Guid>("select AuthId from MR.tUser where UserId = @0", userId);
        }

        public Guid AuthUser(string email, string passwordHash)
        {
            var db = new Database(_config.ConnectionString, "System.Data.SqlClient");
            return db.SingleOrDefault<Guid>("select AuthId from MR.tUser where Email = @0 AND Passwd = @1", email, passwordHash);
        }

        public Guid GetAuthId(string email)
        {
            var db = new Database(_config.ConnectionString, "System.Data.SqlClient");
            return db.SingleOrDefault<Guid>("select AuthId from MR.tUser where Email = @0", email);
        }


        public void SetPassword(string email, string passwordHash)
        {
            var db = new Database(_config.ConnectionString, "System.Data.SqlClient");
            db.Execute("update MR.tUser set Passwd = @1 where Email = @0", email, passwordHash);
        }
        public void SetApiKey(int userId, string apiKey)
        {
            var db = new Database(_config.ConnectionString, "System.Data.SqlClient");
            db.Execute("update MR.tUser set ApiKey = @1 where UserId = @0", userId, apiKey);
        }

        public bool EmailExists(string email)
        {
            var db = new Database(_config.ConnectionString, "System.Data.SqlClient");
            return db.Single<bool>("select count(*) from MR.tUser where Email = @0", email);
        }

        public User GetUser(string email)
        {
            var db = new Database(_config.ConnectionString, "System.Data.SqlClient");
            return db.SingleOrDefault<User>("select * from MR.tUser where Email = @0", email);
        }
        public User GetUserByApiKey(string apiKey)
        {
            var db = new Database(_config.ConnectionString, "System.Data.SqlClient");
            return db.SingleOrDefault<User>("select * from MR.tUser where ApiKey = @0", apiKey);
        }

        public User GetUser(Guid authId)
        {
            var db = new Database(_config.ConnectionString, "System.Data.SqlClient");
            return db.SingleOrDefault<User>("select * from MR.tUser where AuthId = @0", authId);
        }


        public class User
        {
            public Guid AuthId { get; set; }

            public int UserId { get; set; }

            public string Email { get; set; }

            public string DisplayName { get; set; }

            public string Passwd { get; set; }

            public int LastCultureId { get; set; }
        }
    }
}
