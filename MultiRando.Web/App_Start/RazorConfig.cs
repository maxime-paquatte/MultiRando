using System.Collections.Generic;
using Nancy.ViewEngines.Razor;

namespace MultiRando.Web
{
    public class RazorConfig : IRazorConfiguration
    {
        public IEnumerable<string> GetAssemblyNames()
        {
            yield return "NevaUtils";
            yield return "Neva.Messaging";
            yield return "Neva.Resource.Model";
            yield return "Cassette";
            yield return "Cassette.Nancy";
            yield return "Cassette.Owin.ViewEngines.NancyRazor";
            yield return "Nancy";
        }

        public IEnumerable<string> GetDefaultNamespaces()
        {
            yield return "Cassette.Nancy";
            yield return "MultiRando.Web.Core.Helpers";
            yield return "Cassette.Owin.ViewEngines.NancyRazor";
            yield return "Nancy";
        }

        public bool AutoIncludeModelNamespace
        {
            get { return true; }
        }
    }
}
