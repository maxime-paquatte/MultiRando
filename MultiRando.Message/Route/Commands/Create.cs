using Neva.Messaging;

namespace MultiRando.Message.Route.Commands
{
    public class Create : ICommand
    {
        public string Name { get; set; }
    }
}
