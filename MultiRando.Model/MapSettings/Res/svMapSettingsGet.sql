﻿-- Version = 5.3.31, Package = MR.MapSettingsHome, Requires={  }

ALTER procedure MR.svMapSettingsGet
(
	@_ApplicationId	int,
	@_ActorId		int,
	@_CultureId		int
)
as begin
--[beginsp]

	

	select top 1
		MapCenterLat =  CAST(s.MapCenter.Lat as decimal(18,16)),
		MapCenterLong = CAST(s.MapCenter.Long as decimal(18,16)),
		s.MapZoom,
		s.MapTypeId
	from [MR].[tMapSettings] s
	where UserId = @_ActorId OR UserId = 1
	order by UserId DESC
	FOR XML PATH('data'), root('data'),  ELEMENTS, TYPE

--[endsp]
end
