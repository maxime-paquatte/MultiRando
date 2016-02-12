-- Version = 6.2.12, Requires={   }


ALTER procedure MR.scUserSettingsSetActivity
(
	@_ApplicationId		int,
	@_ActorId			int,
	@_CultureId			int,
	@_CommandId			nvarchar(128),

	@Activity		int
)
as begin
--[beginsp]

	set xact_abort on
	Begin tran
	
	if not exists (select 1 from [MR].[tUserSettings] where UserId = @_ActorId)
		insert into [MR].[tUserSettings] (UserId) values(@_ActorId);

	update [MR].[tUserSettings] 
	set Activity = @Activity
	where UserId = @_ActorId

	declare @event xml = (
	select "@Name" = 'MultiRando.Message.UserSettings.Events.Changed', UserId = @_ActorId
	FOR XML PATH('Event'), ELEMENTS )
	exec Neva.sFireCommandEvents @_CommandId, @event

	commit
	--rollback 
--[endsp]
end
