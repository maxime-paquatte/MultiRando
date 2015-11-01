using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Nancy;
using Nancy.ErrorHandling;
using Nancy.ViewEngines;

namespace MultiRando.Web.Modules
{
    public class NotFoundStatusHandler : IStatusCodeHandler
    {
        private readonly IViewRenderer _viewRenderer;

        public NotFoundStatusHandler(IViewRenderer viewRenderer)
        {
            _viewRenderer = viewRenderer;
        }

        public bool HandlesStatusCode(HttpStatusCode statusCode, NancyContext context)
        {
            return statusCode == HttpStatusCode.NotFound
                || statusCode == HttpStatusCode.MethodNotAllowed
                || statusCode == HttpStatusCode.Forbidden;
        }

        public void Handle(HttpStatusCode statusCode, NancyContext context)
        {
            var response = _viewRenderer.RenderView(context, "/status/404", new { StatusCode = statusCode });
            response.StatusCode = statusCode;
            context.Response = response;
        }
    }
}
