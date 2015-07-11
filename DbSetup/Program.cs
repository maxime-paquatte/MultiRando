using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CK.Core;

namespace DbSetup
{
    class Program
    {
        static void Main(string[] args)
        {
            var cs = args[0];
            var path = args.Length == 2 ? args[1] : Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);


            var logger = new DefaultActivityLogger();
            logger.Tap.Register(new ActivityLoggerTextWriterSink(Console.Out));

            using (var fs = File.OpenWrite(Path.Combine(path, "DbSetup.log")))
            using (var w = new StreamWriter(fs, Encoding.UTF8))
            {
                logger.Tap.Register(new ActivityLoggerTextWriterSink(w));
                SetupManager.Setup(cs, path, logger);
            }

        }
    }
}
