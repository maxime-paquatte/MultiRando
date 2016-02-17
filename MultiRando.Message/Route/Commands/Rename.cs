using Neva.Messaging;

namespace MultiRando.Message.Route.Commands
{
    public class Rename : ICommand
    {
        public int RouteId { get; set; }

        public string Name { get; set; }
    }
}
