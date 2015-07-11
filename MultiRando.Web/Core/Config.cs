using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Nancy;
using NevaUtils;

namespace MultiRando.Web.Core
{
    public class Config :  Neva.Resource.Model.IResDbConfig
    {
        public string ConnectionString { get; private set; }
        public string ConnectionStringName { get { return "default"; } }
        public string AppPath { get; set; }

        private Config()
        {

            ConnectionString = ConfigurationManager.ConnectionStrings[ConnectionStringName].ConnectionString;
        }

        private static Config _current;
        public static Config Current
        {
            get { return _current ?? (_current = new Config()); }
        }

    }
}
