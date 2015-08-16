﻿using Neva.Messaging;

namespace MultiRando.Message.Route.Events
{
    public class Created : IEvent
    {
        public string Source { get; set; }

        public string RouteId { get; set; }
    }
}
