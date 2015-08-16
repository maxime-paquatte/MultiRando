-- Version = 5.8.15, Package = MR.MapSettingsHome, Requires={   }


ALTER procedure MR.scMapSettingsSet
(
	@_ApplicationId		int,
	@_ActorId			int,
	@_CultureId			int,
	@_CommandId			nvarchar(128),

	@Lat		decimal(18,16),
	@Long		decimal(18,16),
	
	@Zoom		tinyint,
	@MapTypeId	varchar(128)
)
as begin
--[beginsp]

	set xact_abort on
	Begin tran
	
	if not exists (select 1 from [MR].[tMapSettings] where UserId = @_ActorId)
		insert into [MR].[tMapSettings] (UserId) values(@_ActorId);

	update [MR].[tMapSettings] 
	set MapCenter = geography::Point(@Lat, @Long, 4326), MapZoom = @Zoom, MapTypeId = @MapTypeId
	where UserId = @_ActorId

	declare @event xml = (
	select "@Name" = 'MultiRando.Message.MapSettings.Events.Changed', UserId = @_ActorId
	FOR XML PATH('Event'), ELEMENTS )
	exec Neva.sFireCommandEvents @_CommandId, @event

	commit
	--rollback 
--[endsp]
end
