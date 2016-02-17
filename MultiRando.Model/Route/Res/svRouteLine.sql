-- Version = 6.2.13, Requires={ }

ALTER procedure MR.svRouteLine
(
	@_ApplicationId	int,
	@_ActorId		int,
	@_CultureId		int,

	@RouteId int
)
as begin
--[beginsp]

	select t.LineString.ToString()
	from [MR].tRoute t
	where t.RouteId = @RouteId
			
	FOR XML PATH('data'), root('data'),  ELEMENTS, TYPE

--[endsp]
end
