using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Linq;
using MultiRando.Model.Route;
using MultiRando.Model.Track;
using MultiRando.Web.Core;
using MultiRando.Web.Core.Auth;
using MultiRando.Web.Core.Helpers;
using MultiRando.Web.Core.Services;
using Nancy;
using Nancy.Security;

namespace MultiRando.Web.Modules
{
    public class MapModule : NancyModule
    {
        private readonly Config _cfg;
        private readonly TrackRepository _gpxRepository;
        private readonly RouteRepository _routeRepository;
        private const string FilePrivatePath = @"..\Private\Files\GPX\";

        public MapModule(Config cfg, TrackRepository gpxRepository, RouteRepository routeRepository)
        {
            _cfg = cfg;
            _gpxRepository = gpxRepository;
            _routeRepository = routeRepository;
            this.RequiresAuthentication();

            Get["/Map"] = x => View["Index"];
            Get["/Map/Route/DownloadRt2/{id}"] = DownloadRt2;
            Post["/Map/uploadTrack"] = UploadTrack;
        }

        private dynamic UploadTrack(dynamic _)
        {
            List<int> ids = new List<int>();
            foreach (var file in Request.Files)
            {
                if (Path.GetExtension(file.Name)?.ToLower() == ".gpx")
                    ids.Add(UploadTrackGpx(file));
                else if (Path.GetExtension(file.Name)?.ToLower() == ".plt")
                    ids.Add(UploadTrackPlt(file));
            }

            return Response.AsJson(new { result = "success", trackIds = ids });
        }

        private int UploadTrackPlt(HttpFile file)
        {
            var sb = new StringBuilder("LINESTRING(");

            string rawFile = "";
            using (StreamReader reader = new StreamReader(file.Value))
            {
                rawFile = reader.ReadToEnd();
                file.Value.Position = 0;


                string line;

                //skip - first lines
                for (int i = 0; i < 6; i++) line = reader.ReadLine();

                while (!reader.EndOfStream)
                {
                    line = reader.ReadLine();
                    var parts = line?.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
                    if (parts?.Length > 2)
                        sb.Append(parts[1]).Append(" ").Append(parts[0]).Append(',');
                }
                //remove last ,
                sb.Remove(sb.Length - 1, 1);
                sb.Append(")");
            }

            return _gpxRepository.CreatePlt(Context.CurrentUser().UserId, file.Name, rawFile, sb.ToString());
        }

        private int UploadTrackGpx(HttpFile file)
        {
            var name = file.Name;
            
            using (var reader = XmlReader.Create(file.Value))
            {
                var x = XDocument.Load(reader);
                XNamespace df = x.Root.Name.Namespace;
                var xName = x.Element(df.GetName("gpx")).Element(df.GetName("trk")).Element(df.GetName("name"));
                if (xName != null) name = xName.Value;

                var sb = new StringBuilder("LINESTRING(");
                foreach (var seg in x.Element(df.GetName("gpx")).Element(df.GetName("trk")).Elements(df.GetName("trkseg")))
                {
                    foreach (var pt in seg.Elements(df.GetName("trkpt")))
                    {
                        sb.Append(pt.Attribute("lon").Value).Append(" ").Append(pt.Attribute("lat").Value).Append(',');
                    }
                }

                //remove last ,
                sb.Remove(sb.Length - 1, 1);
                sb.Append(")"); ;

                XmlDocument doc = new XmlDocument();
                doc.Load(reader);
                foreach (XmlNode node in doc.Cast<XmlNode>().Where(node => node.NodeType == XmlNodeType.XmlDeclaration))
                    doc.RemoveChild(node);

                string rawXml = doc.OuterXml;

                return _gpxRepository.CreateGpx(Context.CurrentUser().UserId, name, rawXml, sb.ToString());
            }

        }

        private dynamic DownloadRt2(dynamic _)
        {
            var pts = _routeRepository.RoutesPoints((int)_.id);

            string date = DateTime.Now.ToString("dd-MM-yyyy hh:mm:ss");
            
            var sb = new StringBuilder();
            sb.AppendLine("H1,OziExplorer CE Route2 File Version 1.0");
            sb.AppendLine("H2,WGS 84");
            sb.Append("H3,").Append(date).AppendLine(",,0");

            int lineNumber = 1;
            foreach (var pt in pts)
            {
                sb.Append("W,RW").Append(lineNumber.ToString().PadLeft(3,'0')).Append(",")
                    .Append(pt.Lat.ToString(CultureInfo.InvariantCulture).PadLeft(20,' '))
                    .Append(",").Append(pt.Lon.ToString(CultureInfo.InvariantCulture).PadLeft(20, ' '))
                    .AppendLine(",0");
            }
            
            var tmpPath = _cfg.AppPath + @"..\Private\Routes\";
            Directory.CreateDirectory(tmpPath);
            var filePath = Path.Combine(tmpPath, date.Replace(':', '-') + ".rt2");

            File.AppendAllText(filePath, sb.ToString());
            
            return Response.AsFile(filePath);
        }
    }
}
