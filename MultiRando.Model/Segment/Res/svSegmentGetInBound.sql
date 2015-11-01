-- Version = 5.11.1, Package = MR.SegmentHome, Requires={  }

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
	select "@json:Array" = 'true', s.SegmentId, Creator= u.Email, s.Creationdate, s.ActivityFlag,
		Mudding,Scree,Elevation,
		 Polylines = Polylines.ToString()
	from MR.tSegment s
	inner join MR.tUser u on u.UserId = s.CreatorUserId
	where @boundingRect.STIntersects  ( s.Polylines ) = 1
	FOR XML PATH('data'), root('data'),  ELEMENTS, TYPE

--[endsp]
end
