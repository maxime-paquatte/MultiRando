using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using MultiRando.Web.Core.Auth;
using NevaUtils.StdServices;

namespace MultiRando.Web.Core.Services
{
    public class ExceptionLoggerService : IExceptionLoggerService
    {
        private readonly Config _cfg;
        private readonly IUserIdentityProvider _userIdentityProvider;

        public ExceptionLoggerService(Config cfg, IUserIdentityProvider userIdentityProvider)
        {
            _cfg = cfg;
            _userIdentityProvider = userIdentityProvider;
        }

        static string LogPath(string appPath, DateTime now)
        {
            if (string.IsNullOrEmpty(appPath)) throw new ArgumentNullException("appPath");


            var logPath = Path.GetFullPath(Path.Combine(appPath, @"..\Private\Logs\Exceptions\", now.ToString("yy-MM-dd")));
            Directory.CreateDirectory(logPath);
            return Path.Combine(logPath, now.ToBinary() + ".xml");
        }

        public long Log(Exception ex)
        {
            var now = DateTime.UtcNow;

            try
            {
                var path = LogPath(_cfg.AppPath, now);
                var u = _userIdentityProvider.CurrentUser as UserIdentity;
                File.WriteAllText(path, GetXmlString(ex, u, now));
            }
            catch (Exception logEx)
            {
                System.Diagnostics.Trace.TraceError("Unable to write exception log: " + logEx.Message);
            }

            return now.ToBinary();
        }

        public static string GetLog(string appPath, long id)
        {
            var logDate = DateTime.FromBinary(id);
            var fileName = LogPath(appPath, logDate);
            if (File.Exists(fileName))
            {
                return File.ReadAllText(fileName);
            }
            return null;
        }



        public static string GetXmlString(Exception exception, UserIdentity user, DateTime d)
        {
            if (exception == null) throw new ArgumentNullException("exception");
            StringWriter sw = new StringWriter();
            using (XmlWriter xw = XmlWriter.Create(sw, new XmlWriterSettings() { Indent = true }))
            {
                xw.WriteStartElement("Log");
                xw.WriteAttributeString("date", d.ToString("s"));
                WriteException(xw, "exception", exception);
                WriteContext(xw, "context", user);
                xw.WriteEndElement();
            }
            return sw.ToString();
        }

        static void WriteException(XmlWriter writer, string name, Exception exception)
        {
            if (exception == null) return;
            writer.WriteStartElement(name);
            writer.WriteElementString("Message", exception.Message);
            writer.WriteStartElement("StackTrace");
            writer.WriteCData(exception.StackTrace);
            writer.WriteEndElement();

            WriteException(writer, "InnerException", exception.InnerException);
            writer.WriteEndElement();
        }

        static void WriteContext(XmlWriter writer, string name, UserIdentity user)
        {
            if (user == null) return;
            writer.WriteStartElement(name);

            writer.WriteElementString("UserName", user.UserName);
            writer.WriteElementString("Culture", user.CurrentCultureId.ToString());

            writer.WriteStartElement("Claims");
            foreach (var claim in user.Claims)
                writer.WriteElementString("Claim", claim);
            writer.WriteEndElement();

            writer.WriteEndElement();
        }
    }

    public class HandledErrorLog
    {
        public long LogId { get; private set; }

        public Exception Exception { get; private set; }

        public DateTime OccureDate { get; private set; }

        public HandledErrorLog(DateTime occureDate, Exception exception, long logId)
        {
            OccureDate = occureDate;
            Exception = exception;
            LogId = logId;
        }
    }
}
