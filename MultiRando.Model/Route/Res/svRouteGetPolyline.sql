-- Version = 5.3.31, Package = MR.RouteHome, Requires={  }

ALTER procedure MR.svRouteGetPolyline
(
	@_ApplicationId	int,
	@_ActorId		int,
	@_CultureId		int,

	@RouteId		int
)
as begin
--[beginsp]
	
	select RouteId, Polylines = Polylines.ToString()
	from [MR].[tRoute]
	where RouteId = @RouteId and UserId = @_ActorId
	FOR XML PATH('data'), ELEMENTS

--[endsp]
end
