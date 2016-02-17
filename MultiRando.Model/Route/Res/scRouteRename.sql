-- Version = 5.8.15, Requires={   }


ALTER procedure MR.scRouteRename
(
	@_ApplicationId		int,
	@_ActorId			int,
	@_CultureId			int,
	@_CommandId			nvarchar(128),

	@RouteId	int,
	@Name			nvarchar(128)
)
as begin
--[beginsp]

	set xact_abort on
	Begin tran
	
	UPDATE [MR].tRoute set Name = @Name where RouteId = @RouteId

	IF @@ROWCOUNT > 0
	BEGIN
		declare @event xml = (
		select "@Name" = 'MultiRando.Message.Route.Events.Changed', RouteId  = @RouteId
		FOR XML PATH('Event'), ELEMENTS )
		exec Neva.sFireCommandEvents @_CommandId, @event
	END
	commit
	--rollback 
--[endsp]
end
