-- Version = 6.2.13, Requires={  }

ALTER procedure MR.svTrackById
(
	@_ApplicationId	int,
	@_ActorId		int,
	@_CultureId		int,

	@TrackId		int
)
as begin
--[beginsp]

	select t.TrackId, t.Name, t.Creationdate, TrackLength = CAST(LineString.STLength() * 89550 as int)
	from [MR].[tTrack] t
	where t.TrackId = @TrackId
			
	FOR XML PATH('data'), root('data'),  ELEMENTS, TYPE

--[endsp]
end
