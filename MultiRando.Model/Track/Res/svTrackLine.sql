-- Version = 6.2.13, Requires={ MR.vGpxLineString }

ALTER procedure MR.svTrackLine
(
	@_ApplicationId	int,
	@_ActorId		int,
	@_CultureId		int,

	@TrackId int
)
as begin
--[beginsp]

	select v.LINESTRING.ToString()
	from [MR].[tTrack] t
	left outer join MR.vGpxLineString v on v.TrackId = t.TrackId
	where t.UserId = @TrackId
			
	FOR XML PATH('data'), root('data'),  ELEMENTS, TYPE

--[endsp]
end
