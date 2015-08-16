-- Version = 5.8.15, Package = MR.RouteHome, Requires={   }


ALTER procedure MR.scRouteDelete
(
	@_ApplicationId		int,
	@_ActorId			int,
	@_CultureId			int,
	@_CommandId			nvarchar(128),

	@RouteId	int
)
as begin
--[beginsp]

	set xact_abort on
	Begin tran
	
	Delete from [MR].[tRoute] where RouteId = @RouteId

	declare @event xml = (
	select "@Name" = 'MultiRando.Message.Route.Events.Deleted', RouteId  = @RouteId
	FOR XML PATH('Event'), ELEMENTS )
	exec Neva.sFireCommandEvents @_CommandId, @event

	commit
	--rollback 
--[endsp]
end
