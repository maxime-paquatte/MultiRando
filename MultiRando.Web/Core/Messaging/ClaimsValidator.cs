using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Neva.Messaging;

namespace MultiRando.Web.Core.Messaging
{
    public class ClaimsValidator : IClaimsValidator
    {
        public bool ValidateAny(IMessageContext ctx, IEnumerable<string> claims)
        {
            return true;
        }

        public bool ValidateFeature(IMessageContext ctx, string feature)
        {
            return true;
        }
    }
}