using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using MultiRando.Web.Models;

namespace MultiRando.Web.Core.Services
{
    public class TilesService
    {
        private readonly Config _cfg;


        private const int TilePixel = 256;
        private const double X0 = 20037508;
        private const double Y0 = 20037508;
        private const double LargestX = X0;

        public TilesService(Config cfg)
        {
            _cfg = cfg;
        }

        public string DownloadTile(Tile tile)
        {
            return DownloadTile(tile.Col, tile.Row, tile.Zoom);
        }

        public string DownloadTile(double col, double row, int zoom)
        {
            var tilesPath = Path.Combine(_cfg.AppPath + @"..\Private\Tiles\");
            if (!Directory.Exists(tilesPath + zoom))
                for (int i = 0; i < 22; i++) Directory.CreateDirectory(tilesPath + i);

            var filePath = Path.Combine(tilesPath, "" + zoom, col + "-" + row + ".jpg");

            if (!File.Exists(filePath))
            {
                string url = ConfigurationManager.AppSettings["multiRando:wmts:url"];
                if(string.IsNullOrEmpty(url)) throw new Exception("Missing appsettings: multiRando:wmts:url");

                url = string.Format(url, col, row, zoom);
     
                using (var wc = new WebClient())
                {
                    wc.Headers.Add("Referer", "http://localhost");
                    wc.DownloadFile(url, filePath);
                }
            }
            return filePath;
        }

        public IEnumerable<Tile> GetPackageForBound(double minLat, double minlon, double maxLat, double maxlon, int[] zooms)
        {
            return zooms.SelectMany(zoom => GetPackageForBound(minLat, minlon, maxLat, maxlon, zoom));
        }

        public IEnumerable<Tile> GetPackageForBound(double minLat, double minlon, double maxLat, double maxlon, int zoom)
        {

            var topLeft = GetCell(minLat, minlon, zoom);
            var bottomRight = GetCell(maxLat, maxlon, zoom);

            var width = bottomRight.Col - topLeft.Col;
            var height = topLeft.Row - bottomRight.Row;

            for (int col = 0; col <= width; col++)
            {
                for (int row = 0; row <= height; row++)
                {
                    yield return new Tile() {Col = topLeft.Col + col, Row = bottomRight.Row + row, Zoom = zoom};
                }
            }
        }

        private Cell GetCell(double lat, double lon, int zoom)
        {
            var zooms = ZoomScales();
            var pixelSize = zooms[zoom];
            var tileSize = pixelSize * TilePixel;
            double mercatorX, mercatorY;

            GeographicToWebMercator(lon, lat, out mercatorX, out mercatorY);

            mercatorX = Math.Round(mercatorX, 2);
            mercatorY = Math.Round(mercatorY, 2);

            var x = Math.Round(mercatorX + X0, 2);
            var y = Math.Round(Y0 - mercatorY, 2);

            var row = (int)Math.Round(y / tileSize);
            var col = (int)Math.Round(x / tileSize);

            return new Cell() {Col = col, Row = row};
        }

        private double[] _zooms;
        private double[] ZoomScales()
        {
            if (_zooms != null) return _zooms;
            var zooms = new double[22];
            zooms[00] = 156543.0339280410;
            zooms[01] = 78271.5169640205;
            zooms[02] = 39135.7584820102;
            zooms[03] = 19567.8792410051;
            zooms[04] = 9783.9396205026;
            zooms[05] = 4891.9698102513;
            zooms[06] = 2445.9849051256;
            zooms[07] = 1222.9924525628;
            zooms[08] = 611.4962262814;
            zooms[09] = 305.7481131407;
            zooms[10] = 152.8740565704;
            zooms[11] = 76.4370282852;
            zooms[12] = 38.2185141426;
            zooms[13] = 19.1092570713;
            zooms[14] = 9.5546285356;
            zooms[15] = 4.7773142678;
            zooms[16] = 2.3886571339;
            zooms[17] = 1.1943285670;
            zooms[18] = 0.5971642835;
            zooms[19] = 0.2985821417;
            zooms[20] = 0.1492910709;
            zooms[21] = 0.0746455354;
            return _zooms = zooms;
        }


        private static void GeographicToWebMercator(double xLon, double yLat, out double mercatorX, out double mercatorY)
        {
            var y = yLat * 0.017453292519943295;

            mercatorX = 6378137.0 * (xLon * 0.017453292519943295);
            mercatorY = 3189068.5 * Math.Log((1.0 + Math.Sin(y)) / (1.0 - Math.Sin(y)));
        }

        private static double NormalizeX(double x)
        {
            var absX = Math.Abs(x);
            var returnX = absX;
            var isNegative = (x < 0 ? -1 : 1);
            var multiple = Convert.ToInt32(Math.Floor(absX / LargestX));
            var isEven = (multiple % 2) == 0;

            // return x no need to go any further
            if (absX <= LargestX) return x;

            // If is odd number of divisions then need to take largest - x
            // If is event number. then just take the remainder, cause it is coming from 0 then

            while (returnX > LargestX)
            {
                returnX = returnX - LargestX;
                isNegative = isNegative * -1;
            }

            if (isEven)
            {
                return returnX * isNegative;
            }

            // Is not even so need to take largest - x
            return ((LargestX - returnX) * isNegative);
        }
    }
}
