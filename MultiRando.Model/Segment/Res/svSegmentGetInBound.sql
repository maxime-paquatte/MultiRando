﻿-- Version = 5.11.1, Package = MR.SegmentHome, Requires={  }

ALTER procedure MR.svSegmentGetInBound
(
	@_ApplicationId	int,
	@_ActorId		int,
	@_CultureId		int,
	
	@NorthEastLat varchar(128),
	@NorthEastLng varchar(128),
	@SouthWestLat varchar(128),
	@SouthWestLng varchar(128)
)
as begin
--[beginsp]

	
	DECLARE @boundingRect geography
	SET @boundingRect = geography::Parse('POLYGON((' + 
				@NorthEastLng + ' '  + @NorthEastLat + ', ' + 
				@SouthWestLng + ' ' + @NorthEastLat + ', ' + 
				@SouthWestLng + ' ' + @SouthWestLat + ', ' + 
				@NorthEastLng + ' ' + @SouthWestLat + ', ' + 
				@NorthEastLng + ' ' + @NorthEastLat + '))');


	WITH XMLNAMESPACES ('http://james.newtonking.com/projects/json' as json)	
	select "@json:Array" = 'true',	
		r.SegmentId, 
		r.CreationDate, 
		PathLength,
		CreatorId, IsPublic, 
		CanEdit = IIF(CreatorId = @_ActorId OR r.IsPublic = 1, 1, 0),

		r.ActivityFlag, r.Mudding,r.Scree,r.Elevation,

		Polylines = Polylines.ToString()
	from  [MR].[tSegment] r 
	where @boundingRect.STIntersects  ( r.Polylines ) = 1
	ORDER BY CreationDate DESC
			
	FOR XML PATH('data'), root('data'),  ELEMENTS, TYPE

--[endsp]
end
