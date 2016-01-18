-- Version = 5.11.1, Package = MR.SegmentHome, Requires={   }


ALTER procedure MR.scSegmentSetPolyline
(
	@_ApplicationId		int,
	@_ActorId			int,
	@_CultureId			int,
	@_CommandId			nvarchar(128),

	@SegmentId	int,
	@Polylines	varchar(MAX)
)
as begin
--[beginsp]

	set xact_abort on
	Begin tran
	
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

	commit
	--rollback 
--[endsp]
end
