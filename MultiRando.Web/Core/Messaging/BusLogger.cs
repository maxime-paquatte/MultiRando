using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Neva.Messaging;
using NLog;

namespace MultiRando.Web.Core.Messaging
{
    public class BusLogger : IBusLogger
    {

        private static readonly Logger Logger = LogManager.GetLogger("Bus");

        public void Log(string cmdId, string message)
        {
            Logger.Info(cmdId + "\t" + message);
        }
    }
}
