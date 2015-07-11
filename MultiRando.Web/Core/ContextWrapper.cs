using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MultiRando.Web.Core.Auth;
using Nancy;
using Neva.Messaging;
using Neva.Resource.Model;

namespace MultiRando.Web.Core
{
    public class MessageContextWrapper : IMessageContext
    {
        private readonly IUserIdentityProvider _provider;
        private readonly NancyContext _ctx;

        public MessageContextWrapper(IUserIdentityProvider provider, NancyContext ctx)
        {
            _provider = provider;
            _ctx = ctx;
        }

        public UserIdentity User
        {
            get { return (_provider.CurrentUser as UserIdentity) ?? UserIdentity.GetAnonymous(_ctx); }
        }

        public int ApplicationId { get { return 0; } }

        public int ActorId { get { return User.UserId; } }

        public int CultureId { get { return User.CurrentCultureId; } }
    }

    public class ResourceContextWrapper : IResourceContext
    {
        private readonly IUserIdentityProvider _provider;
        private readonly NancyContext _ctx;

        public ResourceContextWrapper(IUserIdentityProvider provider, NancyContext ctx)
        {
            _provider = provider;
            _ctx = ctx;
        }

        public UserIdentity User
        {
            get { return (_provider.CurrentUser as UserIdentity) ?? UserIdentity.GetAnonymous(_ctx); }
        }

        public int CurrentCultureId { get { return User.CurrentCultureId; } }
    }
}
