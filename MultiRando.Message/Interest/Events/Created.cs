﻿using Neva.Messaging;

namespace MultiRando.Message.Interest.Events
{
    public class Created : IEvent
    {
        public string Source { get; set; }

        public int InterestId { get; set; }
    }
}
