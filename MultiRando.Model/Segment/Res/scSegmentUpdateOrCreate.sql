-- Version = 5.8.15, Package = MR.SegmentHome, Requires={   }


ALTER procedure MR.scSegmentUpdateOrCreate
(
	@_ApplicationId		int,
	@_ActorId			int,
	@_CultureId			int,
	@_CommandId			nvarchar(128),
	
	@SegmentId int,
	@Polylines	varchar(MAX)
)
as begin
--[beginsp]

	set xact_abort on
	Begin tran
	
		declare @p varchar(MAX) = 'MULTIPOINT('+ @Polylines +')';
		if @SegmentId = 0 
		BEGIN
			insert into MR.tSegment (Polylines, CreatorUserId) values(@p, @_ActorId);
			set @SegmentId = SCOPE_IDENTITY();
		END 
		ELSE
		BEGIN
			update MR.tSegment set Polylines = @p where SegmentId = @SegmentId
		END


		declare @event xml = (
		select "@Name" = 'MultiRando.Message.Segment.Events.Changed', SegmentId  = @SegmentId
		FOR XML PATH('Event'), ELEMENTS )
		exec Neva.sFireCommandEvents @_CommandId, @event

	commit
	--rollback 
--[endsp]
end
