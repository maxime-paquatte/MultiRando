﻿-- Version = 6.2.13, Requires={  }

ALTER procedure MR.svTrackForActor
(
	@_ApplicationId	int,
	@_ActorId		int,
	@_CultureId		int
)
as begin
--[beginsp]

	WITH XMLNAMESPACES ('http://james.newtonking.com/projects/json' as json)	
	select "@json:Array" = 'true', t.TrackId, t.Name, t.Creationdate
	from [MR].[tTrack] t
	where t.UserId = @_ActorId
			
	FOR XML PATH('data'), root('data'),  ELEMENTS, TYPE

--[endsp]
end
