-- Version = 6.3.30,  Requires={   }


ALTER procedure MR.scInterestUpdate
(
	@_ApplicationId		int,
	@_ActorId			int,
	@_CultureId			int,
	@_CommandId			nvarchar(128),
	
	@InterestId int,
	@Comment nvarchar(MAX) = ''
)
as begin
--[beginsp]
	if exists (select 1 from MR.tInterest where InterestId = @InterestId AND CreatorUserId = @_ActorId)
	BEGIN
	
		update [MR].[tInterest] set Comment = @Comment where InterestId = @InterestId

		IF @@ROWCOUNT > 0
		BEGIN
			declare @event xml = (
			select "@Name" = 'MultiRando.Message.Interest.Events.Changed', InterestId  = @InterestId
			FOR XML PATH('Event'), ELEMENTS )
			exec Neva.sFireCommandEvents @_CommandId, @event
		END
	END
--[endsp]
end
