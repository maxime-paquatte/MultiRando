using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CK.Setup;
using CK.Setup.SqlServer;
using Neva.Messaging.Sql;

namespace MultiRando.Model
{
    [SqlPackage(FullName = "MultiRando", Schema = "MR", Database = typeof(SqlDefaultDatabase), ResourceType = typeof(Package), ResourcePath = "Res"), Versions("5.7.11")]
    public class Package : SqlPackage
    {

        void Construct(CommandEventHome eventHome)
        {
            this.Database.EnsureSchema("MR");
        }
    }
}
