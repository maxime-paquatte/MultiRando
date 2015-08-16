-- Version = 5.8.15, Package = MR.RouteHome, Requires={   }


ALTER procedure MR.scRouteCreate
(
	@_ApplicationId		int,
	@_ActorId			int,
	@_CultureId			int,
	@_CommandId			nvarchar(128),

	@Name	varchar(128)
)
as begin
--[beginsp]

	set xact_abort on
	Begin tran
	
	insert into [MR].tRoute (UserId, Name) values(@_ActorId, @Name);
	declare @RouteId int = SCOPE_IDENTITY()

	declare @event xml = (
	select "@Name" = 'MultiRando.Message.Route.Events.Created', RouteId  = @RouteId
	FOR XML PATH('Event'), ELEMENTS )
	exec Neva.sFireCommandEvents @_CommandId, @event

	commit
	--rollback 
--[endsp]
end
