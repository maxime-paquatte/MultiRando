using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Neva.Messaging;

namespace MultiRando.Message.UserSettings.Commands
{
    public class Set : ICommand
    {
        public decimal Lat { get; set; }

        public decimal Long { get; set; }

        public byte Zoom { get; set; }

        public string MapTypeId { get; set; }
    }
}
