-- Version = 6.3.30, Requires={   }


ALTER procedure MR.scInterestAddMedia
(
	@_ApplicationId		int,
	@_ActorId			int,
	@_CultureId			int,
	@_CommandId			nvarchar(128),
	
	@InterestId int,

	@MediaType nvarchar(32),
	@Value nvarchar(MAX)
)
as begin
--[beginsp]

	set xact_abort on
	Begin tran
	
		insert into MR.tInterestMedia (InterestId, MediaType, Value, CreatorUserId) 
		values(@InterestId, @MediaType, @Value, @_ActorId);
		declare @InterestMediaId int = SCOPE_IDENTITY();


		declare @event xml = (
		select "@Name" = 'MultiRando.Message.Interest.Events.MediaAdded', InterestId  = @InterestId, InterestMediaId  = @InterestMediaId
		FOR XML PATH('Event'), ELEMENTS )
		exec Neva.sFireCommandEvents @_CommandId, @event

	commit
	--rollback 
--[endsp]
end
