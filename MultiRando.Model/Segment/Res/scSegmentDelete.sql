-- Version = 5.8.15, Package = MR.SegmentHome, Requires={   }


ALTER procedure MR.scSegmentDelete
(
	@_ApplicationId		int,
	@_ActorId			int,
	@_CultureId			int,
	@_CommandId			nvarchar(128),

	@SegmentId	int
)
as begin
--[beginsp]

	set xact_abort on
	Begin tran
	
	Delete from [MR].[tSegment] where SegmentId = @SegmentId

	declare @event xml = (
	select "@Name" = 'MultiRando.Message.Segment.Events.Deleted', SegmentId  = @SegmentId
	FOR XML PATH('Event'), ELEMENTS )
	exec Neva.sFireCommandEvents @_CommandId, @event

	commit
	--rollback 
--[endsp]
end
