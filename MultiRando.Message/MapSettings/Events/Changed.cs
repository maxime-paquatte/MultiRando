using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Neva.Messaging;

namespace MultiRando.Message.MapSettings.Events
{
    public class Changed : IEvent
    {
        public string Source { get; set; }

        public string UserId { get; set; }
    }
}
