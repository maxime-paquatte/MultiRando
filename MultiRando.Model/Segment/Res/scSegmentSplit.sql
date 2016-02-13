-- Version = 6.2.13, Package = MR.SegmentHome, Requires={   }


ALTER procedure MR.scSegmentSplit
(
	@_ApplicationId		int,
	@_ActorId			int,
	@_CultureId			int,
	@_CommandId			nvarchar(128),

	@SegmentId	int,
	@PolylinesA	nvarchar(MAX),
	@PolylinesB	nvarchar(MAX)
)
as begin
--[beginsp]

	set xact_abort on
	Begin tran
	
	declare @a varchar(MAX) = 'MULTIPOINT('+ @PolylinesA +')';
	declare @b varchar(MAX) = 'MULTIPOINT('+ @PolylinesB +')';
	
	insert into [MR].[tSegment] (CreatorId, ActivityFlag, Mudding, Elevation, Scree, IsRoad, Polylines)
	select @_ActorId, ActivityFlag, Mudding, Elevation, Scree, IsRoad, geography::Parse(@b)
	from [MR].[tSegment] where SegmentId = @SegmentId

	declare @NewSegmentId int = SCOPE_IDENTITY();

	update [MR].[tSegment] set Polylines =  geography::Parse(@a)
	where SegmentId = @SegmentId

	declare @event xml = (
	select "@Name" = 'MultiRando.Message.Segment.Events.Splitted', SegmentId  = @SegmentId, NewSegmentId = @NewSegmentId
	FOR XML PATH('Event'), ELEMENTS )
	exec Neva.sFireCommandEvents @_CommandId, @event

	commit
	--rollback 
--[endsp]
end
