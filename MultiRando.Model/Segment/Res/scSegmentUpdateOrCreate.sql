-- Version = 5.11.1, Package = MR.SegmentHome, Requires={   }


ALTER procedure MR.scSegmentUpdateOrCreate
(
	@_ApplicationId		int,
	@_ActorId			int,
	@_CultureId			int,
	@_CommandId			nvarchar(128),
	
	@SegmentId int,
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
		if @SegmentId = 0 
		BEGIN
			insert into MR.tSegment (Polylines, CreatorUserId, ActivityFlag, Mudding, Scree, Elevation) 
			values(@p, @_ActorId, @ActivityFlag, @Mudding, @Scree,@Elevation);
			set @SegmentId = SCOPE_IDENTITY();
		END 
		ELSE
		BEGIN
			update MR.tSegment set Polylines = @p, ActivityFlag = @ActivityFlag,
				Mudding = @Mudding, Scree = @Scree, Elevation = @Elevation
			where SegmentId = @SegmentId
		END


		declare @event xml = (
		select "@Name" = 'MultiRando.Message.Segment.Events.Changed', SegmentId  = @SegmentId
		FOR XML PATH('Event'), ELEMENTS )
		exec Neva.sFireCommandEvents @_CommandId, @event

	commit
	--rollback 
--[endsp]
end
