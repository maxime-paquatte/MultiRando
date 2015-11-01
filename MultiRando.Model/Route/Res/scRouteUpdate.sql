-- Version = 5.11.1, Package = MR.RouteHome, Requires={   }


ALTER procedure MR.scRouteUpdate
(
	@_ApplicationId		int,
	@_ActorId			int,
	@_CultureId			int,
	@_CommandId			nvarchar(128),
	
	@RouteId	int,
	@Name		varchar(128),
	@IsPublic	bit,
	@Comment	varchar(MAX) = ''
)
as begin
--[beginsp]

	set xact_abort on
	Begin tran
	
	update [MR].[tRoute] set
		Name = @Name,
		Comment = @Comment,
		IsPublic = @IsPublic
	where RouteId = @RouteId

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
