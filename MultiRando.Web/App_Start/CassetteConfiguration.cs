using System;
using System.Configuration;
using System.IO;
using Cassette;
using Cassette.HtmlTemplates;
using Cassette.Scripts;
using Cassette.Stylesheets;

namespace MultiRando.Web
{
    public class CassetteConfiguration : IConfiguration<BundleCollection>
    {

        public void Configure(BundleCollection bundles)
        {

            var epcdnUrl = ConfigurationManager.AppSettings["multiRando:cdn:RootUrl"];
            if (string.IsNullOrEmpty(epcdnUrl)) throw new Exception("Missing configuration: multiRando:cdn:RootUrl");

            bundles.AddPerSubDirectory<StylesheetBundle>("Content");
            bundles.Add<StylesheetBundle>("ContentApp/default.css", b => b.AddReference("~/Content/"));
            bundles.AddUrlWithAlias("//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css", "Content/font-awesome.css");



            bundles.Add<ScriptBundle>("Scripts");
            bundles.Add<ScriptBundle>("ScriptsApp/");
            bundles.Add<ScriptBundle>("ScriptsApp/model");
            bundles.Add<ScriptBundle>("ScriptsApp/viewModel");
            bundles.AddPerSubDirectory<ScriptBundle>("ScriptsApp/app");
            bundles.AddPerSubDirectory<ScriptBundle>("ScriptsApp/admin");


            bundles.AddUrlWithAlias<ScriptBundle>("https://maps.googleapis.com/maps/api/js?key=AIzaSyCW6Uwlr80p8LYgGs2_t8ZFwmS9yyPIt9c", "scripts/google.map.js");

            bundles.AddUrlWithAlias(epcdnUrl + "scripts/ep.core.1.0.0.js", "ScriptsApp/ep.core.js", b => b.AddReference("~/Scripts"));
            bundles.AddUrlWithAlias(epcdnUrl + "scripts/ep.ModelBase.1.0.0.js", "ScriptsApp/ep.ModelBase.js", b => b.AddReference("~/Scripts"));
            bundles.AddUrlWithAlias(epcdnUrl + "scripts/ep.ViewModelBase.1.0.0.js", "ScriptsApp/ep.ViewModelBase.js", b => b.AddReference("~/Scripts"));
            bundles.AddUrlWithAlias(epcdnUrl + "scripts/ep.messaging.1.1.0.js", "ScriptsApp/ep.messaging.js", b => b.AddReference("~/Scripts"));
            bundles.AddUrlWithAlias(epcdnUrl + "scripts/ep.modal.1.0.0.js", "ScriptsApp/ep.modal.js", b => b.AddReference("~/Scripts"));
            bundles.AddUrlWithAlias(epcdnUrl + "scripts/ep.lastViewedManager.1.1.0.js", "ScriptsApp/ep.lastViewedManager.js", b => b.AddReference("~/Scripts"));
            bundles.AddUrlWithAlias(epcdnUrl + "scripts/ep.PromptFreeTxt.1.0.0.js", "ScriptsApp/ep.PromptFreeTxt.js", b =>
            {
                b.AddReference("/ScriptsApp/ep.ViewModelBase.js");
                b.AddReference("/ScriptsApp/ep.modal.js");
            });
            bundles.AddUrlWithAlias(epcdnUrl + "scripts/ep.dbObjRepoValue.1.0.0.js", "ScriptsApp/ep.dbObjRepoValue.js", b =>
            {
                b.AddReference("/ScriptsApp/ep.ViewModelBase.js");
                b.AddReference("/ScriptsApp/ep.modal.js");
            });

            bundles.AddPerIndividualFile<HtmlTemplateBundle>("HtmlTemplates");
        }
    }

    public class CassetteFileAuthorizationConfiguration : IConfiguration<IFileAccessAuthorization>
    {
        public void Configure(IFileAccessAuthorization authorization)
        {
            authorization.AllowAccess(path => path.StartsWith("/Content", StringComparison.OrdinalIgnoreCase));
            authorization.AllowAccess(path => path.StartsWith("/ContentApp", StringComparison.OrdinalIgnoreCase));
            authorization.AllowAccess(path => path.StartsWith("/fonts", StringComparison.OrdinalIgnoreCase));
            authorization.AllowAccess(path => path.StartsWith("/Scripts/ckeditor", StringComparison.OrdinalIgnoreCase));
        }
    }
}
