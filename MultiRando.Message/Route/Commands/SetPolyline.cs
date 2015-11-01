﻿using Neva.Messaging;

namespace MultiRando.Message.Route.Commands
{
    public class SetPolyline : ICommand
    {
        public int RouteId { get; set; }

        public int PathLength { get; set; }

        public string Polylines { get; set; }
    }
}
