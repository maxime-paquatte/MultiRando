-- Version = 5.11.1, Package = MR.InterestHome, Requires={   }


ALTER procedure MR.scInterestUpdateOrCreate
(
	@_ApplicationId		int,
	@_ActorId			int,
	@_CultureId			int,
	@_CommandId			nvarchar(128),
	
	@InterestId int,
	@ActivityFlag int,

	@Mudding tinyint,
	@Scree tinyint,
	@Elevation tinyint,

	@Polylines	varchar(MAX)
)
as begin
--[beginsp]

	set xact_abort on
	Begin tran
	
		declare @p varchar(MAX) = 'MULTIPOINT('+ @Polylines +')';
		if @InterestId = 0 
		BEGIN
			insert into MR.tInterest (Polylines, CreatorUserId, ActivityFlag, Mudding, Scree, Elevation) 
			values(@p, @_ActorId, @ActivityFlag, @Mudding, @Scree,@Elevation);
			set @InterestId = SCOPE_IDENTITY();
		END 
		ELSE
		BEGIN
			update MR.tInterest set Polylines = @p, ActivityFlag = @ActivityFlag,
				Mudding = @Mudding, Scree = @Scree, Elevation = @Elevation
			where InterestId = @InterestId
		END


		declare @event xml = (
		select "@Name" = 'MultiRando.Message.Interest.Events.Changed', InterestId  = @InterestId
		FOR XML PATH('Event'), ELEMENTS )
		exec Neva.sFireCommandEvents @_CommandId, @event

	commit
	--rollback 
--[endsp]
end
