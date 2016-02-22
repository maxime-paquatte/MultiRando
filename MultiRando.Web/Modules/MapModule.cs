using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Linq;
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
        private const string FilePrivatePath = @"..\Private\Files\GPX\";

        public MapModule(Config cfg, TrackRepository gpxRepository)
        {
            this.RequiresAuthentication();

            Get["/Map"] = x => View["Index"];

            Post["/Map/uploadGpx"] = _ =>
            {
                var file = Request.Files.FirstOrDefault();
                if (file == null) return Response.AsJson(new { result = "nofiles" });

                var name = file.Name;

                int trackId;
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
                    sb.Append(")");;

                    XmlDocument doc = new XmlDocument();
                    doc.Load(reader);
                    foreach (XmlNode node in doc.Cast<XmlNode>().Where(node => node.NodeType == XmlNodeType.XmlDeclaration))
                        doc.RemoveChild(node);

                    string rawXml = doc.OuterXml;

                    trackId = gpxRepository.CreateGpx(Context.CurrentUser().UserId, name, rawXml, sb.ToString());
                }
                return Response.AsJson(new { result = "success", trackId });
            };

            Post["/Map/uploadPlt"] = _ =>
            {
                var file = Request.Files.FirstOrDefault();
                if (file == null) return Response.AsJson(new { result = "nofiles" });

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
                        var parts = line?.Split(new [] { ',' }, StringSplitOptions.RemoveEmptyEntries);
                        if (parts?.Length > 2)
                            sb.Append(parts[1]).Append(" ").Append(parts[0]).Append(',');
                    }
                    //remove last ,
                    sb.Remove(sb.Length - 1, 1);
                    sb.Append(")");
                }

                int trackId = gpxRepository.CreatePlt(Context.CurrentUser().UserId, file.Name, rawFile, sb.ToString());
                return Response.AsJson(new { result = "success", trackId = trackId });
            };
        }
    }
}
