-- Version = 5.8.15, Package = MR.SegmentHome, Requires={   }


ALTER procedure MR.scSegmentCreate
(
	@_ApplicationId		int,
	@_ActorId			int,
	@_CultureId			int,
	@_CommandId			nvarchar(128),

	@Name	varchar(128)
)
as begin
--[beginsp]

	set xact_abort on
	Begin tran
	
	insert into [MR].tSegment (UserId, Name) values(@_ActorId, @Name);
	declare @SegmentId int = SCOPE_IDENTITY()

	declare @event xml = (
	select "@Name" = 'MultiRando.Message.Segment.Events.Created', SegmentId  = @SegmentId
	FOR XML PATH('Event'), ELEMENTS )
	exec Neva.sFireCommandEvents @_CommandId, @event

	commit
	--rollback 
--[endsp]
end
