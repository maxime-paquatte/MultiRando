using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Nancy.TinyIoc;
using Neva.Messaging;

namespace MultiRando.Web.Core.Messaging
{
    public class IoCActivator : IActivator
    {
        private readonly TinyIoCContainer _container;

        public IoCActivator(TinyIoCContainer container)
        {
            _container = container;
        }

        public object Create(Type t)
        {
            return _container.Resolve(t);
        }
    }
}
