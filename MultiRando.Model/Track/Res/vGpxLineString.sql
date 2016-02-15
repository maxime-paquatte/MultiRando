-- Version = 5.8.15, Requires={   }

ALTER view MR.vGpxLineString as

	with vals as
	(
		SELECT t.*, LineString = (
			select Loc.value('@lon', 'nvarchar(16)') + ' ' + Loc.value('@lat', 'nvarchar(16)') + ','
			FROM Gpx.nodes('/*:gpx/*:trk/*:trkseg/*:trkpt') as T2(Loc) 
			for xml PATH('')
		)
		from [MR].tTrack t
	)
	select TrackId, v.UserId, StrPoints = LineString, LINESTRING = geometry::Parse('LINESTRING(' + SUBSTRING(LineString, 0, LEN(LineString) - 1) + ')')
	from vals v