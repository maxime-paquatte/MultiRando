﻿-- Version = 6.2.13, Package = MR.SegmentHome, Requires={   }


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
	@IsRoad		bit = null,

	@Polylines nvarchar(MAX)= null
)
as begin
--[beginsp]

	set xact_abort on
	Begin tran

	IF @Polylines is not null
	BEGIN
		declare @p varchar(MAX) = 'MULTIPOINT('+ @Polylines +')';
		declare @event xml;
		IF @SegmentId > 0
		BEGIN
			update [MR].[tSegment] set Polylines = geography::Parse(@p)	where SegmentId = @SegmentId

			set @event = ( select "@Name" = 'MultiRando.Message.Segment.Events.Changed', SegmentId  = @SegmentId
			FOR XML PATH('Event'), ELEMENTS )
		END
		ELSE
		BEGIN
			insert into [MR].[tSegment] (CreatorId, Polylines) values(@_ActorId, geography::Parse(@p))
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
			IsRoad = ISNULL(@IsRoad, IsRoad)
		where SegmentId = @SegmentId
	END
	commit
	--rollback 
--[endsp]
end
