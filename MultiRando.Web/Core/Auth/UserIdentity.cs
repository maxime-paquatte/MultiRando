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

        public bool IsAnonymous => UserId == 0;
    }


    public interface IUserIdentityProvider
    {
        IUserIdentity CurrentUser { get; set; }
    }

    public class UserIdentityProvider : IUserIdentityProvider
    {
        public IUserIdentity CurrentUser { get; set; }
    }

    public static class UserIdentityExt
    {
        public static bool IsAnonymous(this IUserIdentity i)
        {
            var epIdentity = i as UserIdentity;
            if (epIdentity == null) return true;
            return epIdentity.IsAnonymous;
        }

        public static UserIdentity CurrentUser(this NancyContext c)
        {
            return (c.CurrentUser as UserIdentity) ?? UserIdentity.GetAnonymous(c);
        }
    }
}
