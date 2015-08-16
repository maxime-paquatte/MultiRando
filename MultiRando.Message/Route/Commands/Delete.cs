using Neva.Messaging;

namespace MultiRando.Message.Route.Commands
{
    public class Delete : ICommand
    {
        public int RouteId { get; set; }
    }
}
