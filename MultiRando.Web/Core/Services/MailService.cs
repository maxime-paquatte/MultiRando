using System;
using System.Configuration;
using System.IO;
using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using NevaUtils;
using NevaUtils.StdServices;

namespace MultiRando.Web.Core.Services
{
    public class MailParam
    {
        public string Subject { get; set; }

        public string From { get; set; }
        public string FromEmail { get; set; }
        public string Reply { get; set; }
        public string ContentText { get; set; }


        public int CultureId { get; set; }

        public string RootUrl { get; set; }
    }

    public interface IMailingService
    {
        bool Send(MailParam p, string recipient, string url = null, string customData = null);
    }

    public class MailingService : IMailingService
    {
        private readonly IExceptionLoggerService _exceptionLoggerService;
        private readonly IResourcesTemplateService _resourcesTemplateService;

        public MailingService(IExceptionLoggerService exceptionLoggerService, IResourcesTemplateService resourcesTemplateService)
        {
            _exceptionLoggerService = exceptionLoggerService;
            _resourcesTemplateService = resourcesTemplateService;
        }

        public bool Send(MailParam p, string recipient, string url = null, string customData = null)
        {
            recipient = ConfigurationManager.AppSettings["epsilon:HookMailAddress"] ?? recipient;


            var message = new MailMessage();

            message.From = new MailAddress(p.FromEmail ?? "contact@epsilon-research.com", p.From);
            message.To.Add(recipient);

            if (!string.IsNullOrEmpty(p.Reply))
                message.ReplyToList.Add(p.Reply);

            if (!string.IsNullOrEmpty(customData))
                message.Headers.Add("Mail-CustomData", customData);

            message.DeliveryNotificationOptions = DeliveryNotificationOptions.OnFailure;

            message.Subject = p.Subject;
            message.IsBodyHtml = false;
            message.Body = p.ContentText + Environment.NewLine + _resourcesTemplateService.GetRes("Res.Mailing.StdSignature", p.CultureId == 0 ? 9 : p.CultureId);

            if (!string.IsNullOrEmpty(url))
            {
                try
                {
                    var request = (HttpWebRequest)WebRequest.Create(Config.Current.MailingRootUrl.TrimEnd('/') + "/" + url.TrimStart('~', '/'));
                    using (var response = (HttpWebResponse)request.GetResponse())
                    {
                        var r = response.GetResponseStream();
                        if (response.StatusCode == HttpStatusCode.OK && r != null)
                        {
                            string bodyHtml = null;
                            using (var reader = new StreamReader(r))
                                bodyHtml = reader.ReadToEnd();

                            var mimeType = new ContentType("text/html");
                            var alternate = AlternateView.CreateAlternateViewFromString(bodyHtml, mimeType);
                            message.AlternateViews.Add(alternate);
                        }
                    }
                }
                catch (Exception ex) { throw new Exception("Unable to obtain mail body: " + url, ex); }
            }

            var client = new SmtpClient();

            try
            {
                client.Send(message);
            }
            catch (Exception ex)
            {
                _exceptionLoggerService.Log(ex);
                return false;
            }


            return true;
        }


        public static Cryption GetCryption()
        {
            return new Cryption("Mailing", "{215A612C-AC85-402A-B707-CA961CE6C458}");
        }
    }
}