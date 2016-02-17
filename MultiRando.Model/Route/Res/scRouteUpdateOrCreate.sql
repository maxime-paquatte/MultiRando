-- Version = 5.8.15, Requires={   }


ALTER procedure MR.scRouteUpdateOrCreate
(
	@_ApplicationId		int,
	@_ActorId			int,
	@_CultureId			int,
	@_CommandId			nvarchar(128),

	@RouteId	int,

	@Name		nvarchar(128),
	@IsPublic	bit,
	@LineString	nvarchar(Max)
)
as begin
--[beginsp]

set xact_abort on
	Begin tran

	IF @LineString is not null
	BEGIN
		declare @p varchar(MAX) = 'LINESTRING('+ @LineString +')';
		declare @event xml;
		IF @RouteId > 0
		BEGIN
			update [MR].tRoute set LineString = geometry::Parse(@p), Name = @Name, IsPublic = @IsPublic where RouteId = @RouteId

			set @event = ( select "@Name" = 'MultiRando.Message.Route.Events.Changed', RouteId  = @RouteId
			FOR XML PATH('Event'), ELEMENTS )
		END
		ELSE
		BEGIN
			insert into [MR].tRoute (CreatorUserId, Name, IsPublic, LineString) values(@_ActorId, @Name, @IsPublic,geometry::Parse(@p))
			set @RouteId = SCOPE_IDENTITY();
			set @event = ( select "@Name" = 'MultiRando.Message.Route.Events.Created', RouteId  = @RouteId
			FOR XML PATH('Event'), ELEMENTS )
		END
		
		exec Neva.sFireCommandEvents @_CommandId, @event
	END
	
	
	commit
	--rollback 
--[endsp]
end
