-- Version = 5.11.1, Package = MR.SegmentHome, Requires={   }


ALTER procedure MR.scSegmentUpdate
(
	@_ApplicationId		int,
	@_ActorId			int,
	@_CultureId			int,
	@_CommandId			nvarchar(128),
	
	@SegmentId	int,
	@Name		varchar(128),
	@IsPublic	bit,
	@Comment	varchar(MAX) = ''
)
as begin
--[beginsp]

	set xact_abort on
	Begin tran
	
	update [MR].[tSegment] set
		Name = @Name,
		Comment = @Comment,
		IsPublic = @IsPublic
	where SegmentId = @SegmentId

	IF @@ROWCOUNT > 0
	BEGIN
		declare @event xml = (
		select "@Name" = 'MultiRando.Message.Segment.Events.Changed', SegmentId  = @SegmentId
		FOR XML PATH('Event'), ELEMENTS )
		exec Neva.sFireCommandEvents @_CommandId, @event
	END
	commit
	--rollback 
--[endsp]
end
