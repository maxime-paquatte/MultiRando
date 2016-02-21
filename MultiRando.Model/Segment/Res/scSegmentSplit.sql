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
	
	declare @a varchar(MAX) = 'LINESTRING('+ @PolylinesA +')';
	declare @b varchar(MAX) = 'LINESTRING('+ @PolylinesB +')';
	
	insert into [MR].[tSegment] (CreatorId, ActivityFlag, Mudding, Elevation, Scree, IsPrivate, IsRoad, NoWay, LineString)
	select @_ActorId, ActivityFlag, Mudding, Elevation, Scree, IsPrivate, IsRoad, NoWay, geometry::Parse(@b)
	from [MR].[tSegment] where SegmentId = @SegmentId

	declare @NewSegmentId int = SCOPE_IDENTITY();

	update [MR].[tSegment] set LineString =  geometry::Parse(@a)
	where SegmentId = @SegmentId

	declare @event xml = (
	select "@Name" = 'MultiRando.Message.Segment.Events.Splitted', SegmentId  = @SegmentId, NewSegmentId = @NewSegmentId
	FOR XML PATH('Event'), ELEMENTS )
	exec Neva.sFireCommandEvents @_CommandId, @event

	commit
	--rollback 
--[endsp]
end
