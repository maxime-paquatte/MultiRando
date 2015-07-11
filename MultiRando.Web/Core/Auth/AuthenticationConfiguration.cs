using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Nancy.Authentication.Forms;
using Nancy.Cryptography;
using Nancy.TinyIoc;

namespace MultiRando.Web.Core.Auth
{
    class AuthenticationConfiguration : FormsAuthenticationConfiguration
    {
        //use Nancy.Cryptography.RandomKeyGenerator to generate salt
        static readonly CryptographyConfiguration Config = new CryptographyConfiguration(
            new RijndaelEncryptionProvider(new PassphraseKeyGenerator("lDfsQk85KtVl371tzJvQr35DjawA5bCk", new byte[] { 132, 108, 135, 114, 227, 20, 142, 178 })),
            new DefaultHmacProvider(new PassphraseKeyGenerator("zhukAfNWgowAqmOyfICDKJvW0LU2gP4K", new byte[] { 210, 215, 27, 136, 252, 162, 0, 236 })));

        public AuthenticationConfiguration(TinyIoCContainer container)
            : base(Config)
        {
            RedirectUrl = "~/Auth/Login";
            UserMapper = container.Resolve<IUserMapper>();
        }
    }


}
