-- Version = 6.2.12, Requires={   }


ALTER procedure MR.scTrackRename
(
	@_ApplicationId		int,
	@_ActorId			int,
	@_CultureId			int,
	@_CommandId			nvarchar(128),

	@TrackId		int,
	@Name			nvarchar(128)
)
as begin
--[beginsp]

	set xact_abort on
	Begin tran
	
	update MR.tTrack set Name = @Name where TrackId = @TrackId

	IF @@ROWCOUNT > 0
	begin
		declare @event xml = (
		select "@Name" = 'MultiRando.Message.Track.Events.Changed', UserId = @_ActorId
		FOR XML PATH('Event'), ELEMENTS )
		exec Neva.sFireCommandEvents @_CommandId, @event
	end
	commit
	--rollback 
--[endsp]
end
