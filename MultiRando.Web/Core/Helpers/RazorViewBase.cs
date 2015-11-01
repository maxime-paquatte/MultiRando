using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Cassette.Owin.ViewEngines.NancyRazor;
using MultiRando.Web.Core.Auth;
using Nancy.TinyIoc;
using Nancy.ViewEngines;
using Nancy.ViewEngines.Razor;
using Newtonsoft.Json;

namespace MultiRando.Web.Core.Helpers
{
    public abstract class RazorViewBase<TModel> : Nancy.ViewEngines.Razor.NancyRazorViewBase<TModel>
    {


        //public Request Request { get; private set; }
        public UserIdentity CurrentUser
        {
            get { return (Html.RenderContext.Context.CurrentUser as UserIdentity) ?? UserIdentity.GetAnonymous(RenderContext.Context); }
        }

        public string RootUrl
        {
            get { return Request.Url.SiteBase; }
        }

        public string Res<T>(T enumVal) where T : struct
        {
            var t = typeof(T);
            if (!t.IsEnum) throw new ArgumentException("T must be an enumerated type");
            var a = t.GetCustomAttribute<ResPrefixAttribute>();
            if (a == null) throw new ArgumentException("T must be decorated by ResPrefixAttribute");


            return RenderContext.Context.Res(a.Prefix + Enum.GetName(t, enumVal));
        }
        public IHtmlString Res(string resName)
        {
            var res = RenderContext.Context.Res(resName);
            if (string.IsNullOrEmpty(res)) return Html.Raw(string.Empty);
            if (res[0] == '?') return Html.Raw("?" + res.Substring(res.LastIndexOf('.') + 1));

            if (res.Contains("<p>")) return Html.Raw(res);
            res = Regex.Replace(res, @"\r\n?|\n", "<br />");
            return Html.Raw(res.Replace("  ", " &nbsp;"));
        }

        public IHtmlString Res(string resName, object templateValues)
        {
            var res = RenderContext.Context.Res(resName, templateValues);
            if (res == null) return Html.Raw(string.Empty);
            if (res.Contains("<p>")) return Html.Raw(res);
            res = Regex.Replace(res, @"\r\n?|\n", "<br />");
            return Html.Raw(res.Replace("  ", " &nbsp;"));
        }
        public string JSon<T>(T o)
        {
            return JsonConvert.SerializeObject(o);
        }

        public override void Initialize(RazorViewEngine engine, IRenderContext renderContext, object model)
        {
            //Request = renderContext.Context.Request;
            // Model should not be null
            if (model == null) model = renderContext.Context.Parameters;
            base.Initialize(engine, renderContext, model);
        }

        public void Reference(string bundle, string name = null)
        {
            Html.Reference(bundle, name);
        }

        public bool IsPropertyExist(dynamic settings, string name)
        {
            if (settings is ExpandoObject)
                return ((IDictionary<String, object>)settings).ContainsKey(name);
            return settings.GetType().GetProperty(name) != null;
        }

    }

    public abstract class EpRazorViewBase : RazorViewBase<dynamic>
    {

    }

    [System.AttributeUsage(System.AttributeTargets.Enum)]
    public class ResPrefixAttribute : Attribute
    {
        public string Prefix { get; set; }
    }


}
