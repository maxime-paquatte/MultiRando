-- Version = 6.2.13, Package = MR.SegmentHome, Requires={   }


ALTER procedure MR.scSegmentUpdate
(
	@_ApplicationId		int,
	@_ActorId			int,
	@_CultureId			int,
	@_CommandId			nvarchar(128),
	
	@SegmentId	int,

	@ActivityFlag		int = null,
	@Mudding	tinyint = null,
	@Elevation	tinyint = null,
	@Scree		tinyint = null,
	@IsPrivate		bit = null,
	@IsRoad		bit = null,
	@NoWay		bit = null,

	@Polylines nvarchar(MAX)= null
)
as begin
--[beginsp]

	set xact_abort on
	Begin tran

	IF @Polylines is not null
	BEGIN
		declare @p varchar(MAX) = 'LINESTRING('+ @Polylines +')';
		declare @event xml;
		IF @SegmentId > 0
		BEGIN
			update [MR].[tSegment] set LineString = geometry::Parse(@p)	where SegmentId = @SegmentId

			set @event = ( select "@Name" = 'MultiRando.Message.Segment.Events.Changed', SegmentId  = @SegmentId
			FOR XML PATH('Event'), ELEMENTS )
		END
		ELSE
		BEGIN
			insert into [MR].[tSegment] (CreatorId, LineString) values(@_ActorId, geometry::Parse(@p))
			set @SegmentId = SCOPE_IDENTITY();
			set @event = ( select "@Name" = 'MultiRando.Message.Segment.Events.Created', SegmentId  = @SegmentId
			FOR XML PATH('Event'), ELEMENTS )
		END
		
		exec Neva.sFireCommandEvents @_CommandId, @event
	END
	
	IF @SegmentId > 0
	BEGIN
		update [MR].[tSegment] set
			ActivityFlag = ISNULL(@ActivityFlag, ActivityFlag),
			Mudding = ISNULL(@Mudding, Mudding),
			Elevation = ISNULL(@Elevation, Elevation),
			Scree = ISNULL(@Scree, Scree),
			IsPrivate = ISNULL(@IsPrivate, IsPrivate),
			IsRoad = ISNULL(@IsRoad, IsRoad),
			NoWay = ISNULL(@NoWay, NoWay)
		where SegmentId = @SegmentId
	END
	commit
	--rollback 
--[endsp]
end
