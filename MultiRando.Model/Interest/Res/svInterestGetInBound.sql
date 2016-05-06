-- Version = 6.5.2, Requires={  }

ALTER procedure MR.svInterestGetInBound
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


	WITH XMLNAMESPACES ('http://james.newtonking.com/projects/json' as json)
	select "@json:Array" = 'true', s.InterestId, 
		Category, Comment, IsPublic, CreationDate, CreatorUserId, CreatorDisplayName = u.DisplayName,
		Lat = STR(Lat, 16, 12), Lon = STR(Lon, 16, 12)
	from MR.tInterest s
	inner join MR.tUser u on u.UserId = s.CreatorUserId	
	where Lat between @SouthWestLat AND @NorthEastLat 
	AND Lon between @SouthWestLng AND @NorthEastLng
	AND ( IsPublic = 1 OR CreatorUserId =  @_ActorId)
	FOR XML PATH('data'), root('data'),  ELEMENTS, TYPE

--[endsp]
end
