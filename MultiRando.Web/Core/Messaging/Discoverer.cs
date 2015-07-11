using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using Neva.Messaging;

namespace MultiRando.Web.Core.Messaging
{
    public static class Discoverer
    {

        public static void Discover(IStore store)
        {
            var allTypes = ReflectionHelpers.FindAllTypes();

            DiscoverCommands(store, allTypes);
            DiscoverEvents(store, allTypes);
            DiscoverReaders(store, allTypes);
        }

        private static void DiscoverCommands(IStore store, IList<Type> allTypes)
        {
            var cmdInterfaceType = typeof(ICommand);
            var cmdHandlerType = typeof(ICommandHandler<>);

            var cmdValidatorType = typeof(ICommandValidator<>);
            var cmdValidatorStdType = typeof(IStdCommandValidator);

            var allCommands = allTypes.Where(p => p != cmdInterfaceType && cmdInterfaceType.IsAssignableFrom(p)).ToList();

            Type tvStd = cmdValidatorType.MakeGenericType(cmdInterfaceType);
            var allCommandValidator = allTypes.Where(p => p != cmdValidatorStdType && tvStd.IsAssignableFrom(p)).ToArray();

            Type thStd = cmdHandlerType.MakeGenericType(cmdInterfaceType);
            var allCommandHandler = allTypes.Where(thStd.IsAssignableFrom).ToArray();


            foreach (Type cmdType in allCommands)
            {
                store.RegisterMessageType(cmdType);

                //specifics validators
                Type tv = cmdValidatorType.MakeGenericType(cmdType);
                foreach (Type validator in allTypes.Where(tv.IsAssignableFrom))
                    store.RegisterValidator(cmdType, validator);

                //validators for all commands
                foreach (Type validator in allCommandValidator)
                    store.RegisterValidator(cmdType, validator);


                //specifics handlers
                Type th = cmdHandlerType.MakeGenericType(cmdType);
                foreach (Type handler in allTypes.Where(th.IsAssignableFrom))
                    store.RegisterCommandHandler(cmdType, handler);

                // handlers for all commands
                foreach (Type handler in allCommandHandler)
                    store.RegisterCommandHandler(cmdType, handler);
            }
        }

        private static void DiscoverEvents(IStore store, IList<Type> allTypes)
        {
            Type eventInterfaceType = typeof(IEvent);
            Type eventHandlerType = typeof(IEventHandler<>);
            var allEvents = allTypes.Where(p => p != eventInterfaceType && eventInterfaceType.IsAssignableFrom(p)).ToList();

            foreach (Type eventType in allEvents)
            {
                store.RegisterMessageType(eventType);

                Type t = eventHandlerType.MakeGenericType(eventType);
                foreach (Type handler in allTypes.Where(t.IsAssignableFrom))
                {
                    store.RegisterEventHandler(eventType, handler);

                }
            }
        }

        private static void DiscoverReaders(IStore store, IList<Type> allTypes)
        {
            Type queryInterfaceType = typeof(IQuery);
            Type queryReaderType = typeof(IQueryJSonReader<>);
            var allQueries = allTypes.Where(p => p != queryInterfaceType && queryInterfaceType.IsAssignableFrom(p)).ToList();

            foreach (Type queryType in allQueries)
            {
                store.RegisterMessageType(queryType);

                Type t = queryReaderType.MakeGenericType(queryType);
                foreach (Type reader in allTypes.Where(t.IsAssignableFrom))
                {
                    store.RegisterReader(queryType, reader);
                }
            }
        }
    }

    public static class ReflectionHelpers
    {
        public static IList<Type> FindAllTypes()
        {
            try
            {
                return AppDomain.CurrentDomain
                    .GetAssemblies()
                    .ToList()
                    .SelectMany(s => s.GetTypes())
                    .Where(p => p.IsClass && !p.IsAbstract && !p.IsInterface)
                    .ToList();
            }
            catch (ReflectionTypeLoadException exception)
            {
                var stringBuilder = new StringBuilder();
                foreach (var loaderException in exception.LoaderExceptions)
                {
                    stringBuilder.AppendLine(loaderException.Message);
                    var fileNotFoundException = loaderException as FileNotFoundException;
                    if (fileNotFoundException != null)
                    {
                        if (!string.IsNullOrEmpty(fileNotFoundException.FusionLog))
                        {
                            stringBuilder.AppendLine("Fusion Log:");
                            stringBuilder.AppendLine(fileNotFoundException.FusionLog);
                        }
                    }
                    stringBuilder.AppendLine();
                }

                throw new Exception(
                    "Failed to reflect on the current domain's Assemblies while searching for plugins. Error Message: " +
                    stringBuilder);
            }
        }
    }
}
