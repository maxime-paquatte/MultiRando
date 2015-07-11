using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CK.Core;
using DbSetup;
using Nancy;

namespace MultiRando.Web.Modules.Admin
{
    public class DatabaseModule : NancyModule
    {
        public DatabaseModule()
            : base("Admin/Database")
        {
            Get["/Setup"] = _ => Response.FromStream(DoSetup, "text/plain");
        }



        private Stream DoSetup()
        {
            var ms = new MemoryStream();
            var w = new StreamWriter(ms, Encoding.UTF8);

            var console = new ActivityLoggerTextWriterSink(w);
            var logger = new DefaultActivityLogger();
            logger.Tap.Register(console);


            SetupManager.Setup(Core.Config.Current.ConnectionString, Path.Combine(Core.Config.Current.AppPath, "bin"), logger);


            w.Flush();
            ms.Seek(0, SeekOrigin.Begin);
            return ms;
        }
    }
}
