-- Version = 6.2.13, Requires={ }
ALTER VIEW MR.vRoute as
	select	 [RouteId]
            ,[Name]
            ,[ActivityFlag]
            ,[IsPublic]
            ,[CreatorUserId]
            ,[Creationdate]
            ,[RouteLength] 
            ,LineString = SUBSTRING(r.LineString.ToString(), LEN('LINESTRING(') + 2, LEN(r.LineString.ToString() )- LEN('LINESTRING(') - 2)
			,Timestamp = CONVERT(bigint, [timestamp])
            ,CreatorDisplayName = u.DisplayName
    from MR.tRoute r inner join MR.tUser u on u.UserId = r.CreatorUserId  