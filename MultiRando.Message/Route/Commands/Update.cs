using Neva.Messaging;

namespace MultiRando.Message.Route.Commands
{
    public class Update : ICommand
    {
        public int RouteId { get; set; }

        public string Name { get; set; }
        public string Comment { get; set; }
        public bool IsPublic { get; set; }
    }
}
