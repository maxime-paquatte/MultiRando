using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Neva.Messaging;

namespace MultiRando.Message.UserSettings.Commands
{
    public class SetActivity : ICommand
    {
        public int Activity { get; set; }
    }
}
