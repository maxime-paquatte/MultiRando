-- Version = 5.11.1, Package = MR.RouteHome, Requires={  }

ALTER procedure MR.svRouteGetPage
(
	@_ApplicationId	int,
	@_ActorId		int,
	@_CultureId		int,

	@Skip		int,
	@Take		int,
	@Total		int
)
as begin
--[beginsp]

	IF @Take <= 0 set @Take = 20	
	IF @Total < 0 select @Total = count(*) from [MR].[tRoute] where UserId = @_ActorId OR IsPublic = 1;

	
	WITH XMLNAMESPACES ('http://james.newtonking.com/projects/json' as json)
	select 
	(
			select Total = @Total
			FOR XML PATH ('pagination'), TYPE
	),
	(
		select "@json:Array" = 'true',	r.RouteId, r.Name, r.CreationDate, PathLength, Comment, UserId, IsPublic
		from  [MR].[tRoute] r where UserId = @_ActorId OR IsPublic = 1
		ORDER BY CreationDate DESC

		OFFSET		@Skip		ROWS
		FETCH NEXT	@Take		ROWS ONLY
		FOR XML PATH('items'),  ELEMENTS, TYPE
		)
	FOR XML PATH('data'), ELEMENTS

--[endsp]
end
