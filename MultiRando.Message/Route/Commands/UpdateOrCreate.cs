using Neva.Messaging;

namespace MultiRando.Message.Route.Commands
{
    public class UpdateOrCreate : ICommand
    {
        public int RouteId { get; set; }

        public string Name { get; set; }

        public bool IsPublic { get; set; }

        public string LineString { get; set; }
    }
}
