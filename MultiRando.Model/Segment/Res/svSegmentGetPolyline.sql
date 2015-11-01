-- Version = 5.3.31, Package = MR.SegmentHome, Requires={  }

ALTER procedure MR.svSegmentGetPolyline
(
	@_ApplicationId	int,
	@_ActorId		int,
	@_CultureId		int,

	@SegmentId		int
)
as begin
--[beginsp]
	
	select SegmentId, Polylines = Polylines.ToString()
	from [MR].[tSegment]
	where SegmentId = @SegmentId and UserId = @_ActorId
	FOR XML PATH('data'), ELEMENTS

--[endsp]
end
