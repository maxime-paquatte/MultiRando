using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MultiRando.Model.User;
using Nancy;
using Nancy.Authentication.Forms;
using Nancy.Security;

namespace MultiRando.Web.Core.Auth
{
    public class UserMapper : IUserMapper
    {
        private readonly UserRepository _repository;

        public UserMapper(UserRepository repository)
        {
            _repository = repository;
        }

        public IUserIdentity GetUserFromIdentifier(Guid identifier, NancyContext context)
        {
            var u = _repository.GetUser(identifier);
            if(u == null) return new UserIdentity();

            return new UserIdentity
            {
                CurrentCultureId = u.LastCultureId,
                UserId = u.UserId,
                UserName = u.Email
            };
        }
    }
}
