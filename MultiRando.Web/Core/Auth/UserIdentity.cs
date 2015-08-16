using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Nancy;
using Nancy.Security;

namespace MultiRando.Web.Core.Auth
{
    public class UserIdentity : IUserIdentity
    {
        public string UserName { get; set; }
        public IEnumerable<string> Claims { get; set; }
        public int UserId { get; set; }
        public int CurrentCultureId { get; set; }

        public static UserIdentity GetAnonymous(NancyContext ctx)
        {
            return new UserIdentity();
        }

        public UserIdentity()
        {
            CurrentCultureId = 9;
            Claims = Enumerable.Empty<string>();
        }
    }


    public interface IUserIdentityProvider
    {
        IUserIdentity CurrentUser { get; set; }
    }

    public class UserIdentityProvider : IUserIdentityProvider
    {
        public IUserIdentity CurrentUser { get; set; }
    }
}
