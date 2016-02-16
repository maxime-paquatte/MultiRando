using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
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

                int trackId;
                using (var reader = XmlReader.Create(file.Value))
                {
                    XmlDocument doc = new XmlDocument();
                    doc.Load(reader);
                    foreach (XmlNode node in doc.Cast<XmlNode>().Where(node => node.NodeType == XmlNodeType.XmlDeclaration))
                        doc.RemoveChild(node);
                    trackId = gpxRepository.CreateGpx(Context.CurrentUser().UserId, file.Name, doc.OuterXml);
                }

                

                return Response.AsJson(new { result = "success", trackId });
            };
        }
    }
}
