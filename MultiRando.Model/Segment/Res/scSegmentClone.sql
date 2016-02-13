-- Version = 6.2.13, Package = MR.SegmentHome, Requires={   }


ALTER procedure MR.scSegmentClone
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
	
	insert into [MR].[tSegment] (CreatorId, ActivityFlag, Mudding, Elevation, Scree, IsRoad)
	select @_ActorId, ActivityFlag, Mudding, Elevation, Scree, IsRoad
	from [MR].[tSegment] where SegmentId = @SegmentId

	declare @NewSegmentId int = SCOPE_IDENTITY();

	declare @event xml = (
	select "@Name" = 'MultiRando.Message.Segment.Events.Cloned', SegmentId  = @SegmentId, NewSegmentId = @NewSegmentId
	FOR XML PATH('Event'), ELEMENTS )
	exec Neva.sFireCommandEvents @_CommandId, @event

	commit
	--rollback 
--[endsp]
end
