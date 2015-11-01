﻿using Neva.Messaging;

namespace MultiRando.Message.Segment.Commands
{
    public class UpdateOrCreate : ICommand
    {
        public int SegmentId { get; set; }

        public int ActivityFlag { get; set; }
        public byte Mudding { get; set; }
        public byte Scree { get; set; }
        public byte Elevation { get; set; }

        public string Polylines { get; set; }
    }
}
