-- Version = 6.2.13, Requires={  }

ALTER procedure MR.svRouteForActor
(
	@_ApplicationId	int,
	@_ActorId		int,
	@_CultureId		int
)
as begin
--[beginsp]

	WITH XMLNAMESPACES ('http://james.newtonking.com/projects/json' as json)	
	select "@json:Array" = 'true', t.RouteId, t.Name, t.Creationdate, t.IsPublic, RouteLength = CAST(LineString.STLength() * 89550 as int)
	from [MR].tRoute t
	where t.CreatorUserId = @_ActorId
			
	FOR XML PATH('data'), root('data'),  ELEMENTS, TYPE

--[endsp]
end
