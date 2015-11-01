-- Version = 5.11.1, Package = MR.SegmentHome, Requires={   }


ALTER procedure MR.scSegmentSetPolyline
(
	@_ApplicationId		int,
	@_ActorId			int,
	@_CultureId			int,
	@_CommandId			nvarchar(128),

	@SegmentId	int,
	@PathLength	int,
	@Polylines	varchar(MAX)
)
as begin
--[beginsp]

	set xact_abort on
	Begin tran
	
	declare @p varchar(MAX) = 'MULTIPOINT('+ @Polylines +')';

	update [MR].[tSegment] set Polylines = geography::Parse(@p), PathLength = @PathLength	where SegmentId = @SegmentId

	declare @event xml = (
	select "@Name" = 'MultiRando.Message.Segment.Events.Changed', SegmentId  = @SegmentId
	FOR XML PATH('Event'), ELEMENTS )
	exec Neva.sFireCommandEvents @_CommandId, @event

	commit
	--rollback 
--[endsp]
end
