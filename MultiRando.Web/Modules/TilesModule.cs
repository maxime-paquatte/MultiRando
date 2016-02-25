using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using MultiRando.Model.Route;
using MultiRando.Web.Core;
using MultiRando.Web.Core.Services;
using MultiRando.Web.Models;
using Nancy;

namespace MultiRando.Web.Modules
{
    public class TilesModule : NancyModule
    {
        //~3km
        private const double BoundMargin = 0;//0.025;

        private readonly Config _cfg;
        private readonly TilesService _tilesService;
        private readonly RouteRepository _routeRepository;

        public TilesModule(Config cfg, TilesService tilesService, RouteRepository routeRepository)
        {
            _cfg = cfg;
            _tilesService = tilesService;
            _routeRepository = routeRepository;

            Get["/Tiles/{zoom}/{x}/{y}"] = GetTile;
            Get["/Tiles/Route/{routeId}"] = GetTileRoute;
        }

        private dynamic GetTile(dynamic _)
        {
            var zoom = (int) _.zoom;
            var col = (double) _.x;
            var row = (double) _.y;

            var filePath = _tilesService.DownloadTile(col, row, zoom);

            return Response.AsFile(filePath);
        }

        private dynamic GetTileRoute(dynamic _)
        {
            int routeId = _.routeId;
            var points = _routeRepository.RoutesPoints(routeId).ToArray();
            var minLat = points.Min(p => p.Lat) - BoundMargin;
            var minLon = points.Min(p => p.Lon) - BoundMargin;

            var maxLat= points.Max(p => p.Lat)  + BoundMargin;
            var maxLon = points.Max(p => p.Lon) + BoundMargin;
            
            var routeTilesPath = Path.Combine(_cfg.AppPath, @"..\Private\RouteTiles");
            var path = Path.Combine(routeTilesPath, routeId +"");
            if(Directory.Exists(path)) Directory.Delete(path, true);

            int zoom = 17;
            int tilescount = int.MaxValue;
            while (tilescount > 1)
            {
                var tiles = _tilesService.GetPackageForBound(minLat, minLon, maxLat, maxLon, zoom).ToArray();

                var zoomPath = Path.Combine(path, "" + zoom);
                Directory.CreateDirectory(zoomPath);

                var r = Task.Factory.StartNew(() => Parallel.ForEach(tiles, tile =>
                {
                    string filePath = _tilesService.DownloadTile(tile);
                    File.Copy(filePath, Path.Combine(zoomPath, tile.Col + "-" + tile.Row + ".jpg"));
                }));
                r.Wait();

                tilescount = tiles.Length;
                zoom --;
            }
            var zipPath = Path.Combine(routeTilesPath, routeId + ".zip");
            if(File.Exists(zipPath))File.Delete(zipPath);
            ZipFile.CreateFromDirectory(path, zipPath, CompressionLevel.Fastest, false);

            return Response.AsFile(zipPath);
        }
    }
}