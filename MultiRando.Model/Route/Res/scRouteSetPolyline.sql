-- Version = 5.11.1, Package = MR.RouteHome, Requires={   }


ALTER procedure MR.scRouteSetPolyline
(
	@_ApplicationId		int,
	@_ActorId			int,
	@_CultureId			int,
	@_CommandId			nvarchar(128),

	@RouteId	int,
	@PathLength	int,
	@Polylines	varchar(MAX)
)
as begin
--[beginsp]

	set xact_abort on
	Begin tran
	
	declare @p varchar(MAX) = 'MULTIPOINT('+ @Polylines +')';

	update [MR].[tRoute] set Polylines = geography::Parse(@p), PathLength = @PathLength	where RouteId = @RouteId

	declare @event xml = (
	select "@Name" = 'MultiRando.Message.Route.Events.Changed', RouteId  = @RouteId
	FOR XML PATH('Event'), ELEMENTS )
	exec Neva.sFireCommandEvents @_CommandId, @event

	commit
	--rollback 
--[endsp]
end
