-- Version = 6.5.2, Requires={  }

ALTER procedure MR.svInterestMedias
(
	@_ApplicationId	int,
	@_ActorId		int,
	@_CultureId		int,

	@InterestId int
)
as begin
--[beginsp]


	WITH XMLNAMESPACES ('http://james.newtonking.com/projects/json' as json)
	select "@json:Array" = 'true', s.*, CreatorDisplayName = u.DisplayName
	from MR.tInterestMedia s
	inner join MR.tUser u on u.UserId = s.CreatorUserId	
	where InterestId = @InterestId
	FOR XML PATH('data'), root('data'),  ELEMENTS, TYPE

--[endsp]
end
