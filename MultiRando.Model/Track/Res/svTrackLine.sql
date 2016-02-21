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

	select t.LineString.ToString()
	from [MR].[tTrack] t
	where t.TrackId = @TrackId
			
	FOR XML PATH('data'), root('data'),  ELEMENTS, TYPE

--[endsp]
end
