using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CK.Core;
using CK.Setup.SqlServer;

namespace DbSetup
{
    public class SetupManager
    {
        public static void Setup(string connectionString, string assembliesPath, IActivityLogger logger)
        {
            using (var context = new SqlSetupContext(connectionString, logger))
            {
                //if( !context.DefaultSqlDatabase.IsOpen() ) context.DefaultSqlDatabase.Open( context.DefaultSqlDatabase.Server );
                using (context.Logger.OpenGroup(LogLevel.Trace, "Begin setup " + DateTime.UtcNow.ToString(CultureInfo.InvariantCulture)))
                {
                    SqlSetupCenter c = new SqlSetupCenter(context);
                    c.DiscoverFilePackages(assembliesPath);

                    var assemblies = new[]
                    {
                        "Neva.Basic.Model",
                        "Neva.Messaging.Sql",
                        "Neva.Resource.Model",

                        
                        "MultiRando.Model"
                       
                    };
                    context.AssemblyRegistererConfiguration.DiscoverAssemblyNames.AddRange(assemblies);
                    c.Run();
                }
            }
        }
    }
}
