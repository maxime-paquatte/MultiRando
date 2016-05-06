-- Version = 6.3.30,  Requires={   }


ALTER procedure MR.scInterestCreate
(
	@_ApplicationId		int,
	@_ActorId			int,
	@_CultureId			int,
	@_CommandId			nvarchar(128),
	
	@Category varchar(16),

	@Lat float,
	@Lon float
)
as begin
--[beginsp]

	set xact_abort on
	Begin tran
	
		insert into MR.tInterest (CreatorUserId, Category, Lat, Lon) 
		values(@_ActorId, @Category, @Lat, @Lon);
		declare @InterestId int = SCOPE_IDENTITY();


		declare @event xml = (
		select "@Name" = 'MultiRando.Message.Interest.Events.Created', InterestId  = @InterestId
		FOR XML PATH('Event'), ELEMENTS )
		exec Neva.sFireCommandEvents @_CommandId, @event

	commit
	--rollback 
--[endsp]
end
