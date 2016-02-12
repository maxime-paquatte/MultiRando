-- Version = 6.2.12, Package = MR.UserSettingsHome, Requires={  }

ALTER procedure MR.svUserSettingsGet
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
		s.MapTypeId,
		s.Activity
	from [MR].[tUserSettings] s
	where UserId = @_ActorId OR UserId = 0
	order by UserId DESC
	FOR XML PATH('data'), root('data'),  ELEMENTS, TYPE

--[endsp]
end
