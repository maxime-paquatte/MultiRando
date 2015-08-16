-- Version = 5.8.15, Package = MR.RouteHome, Requires={   }


ALTER procedure MR.scRouteSetPolyline
(
	@_ApplicationId		int,
	@_ActorId			int,
	@_CultureId			int,
	@_CommandId			nvarchar(128),

	@RouteId	int,
	@Polygon	varchar(MAX)
)
as begin
--[beginsp]

	set xact_abort on
	Begin tran
	
	declare @p varchar(MAX) = 'MULTIPOINT('+ @Polygon +')';

	update [MR].[tRoute] set Polygon = geography::Parse(@p)	where RouteId = @RouteId

	declare @event xml = (
	select "@Name" = 'MultiRando.Message.Route.Events.Changed', RouteId  = @RouteId
	FOR XML PATH('Event'), ELEMENTS )
	exec Neva.sFireCommandEvents @_CommandId, @event

	commit
	--rollback 
--[endsp]
end
