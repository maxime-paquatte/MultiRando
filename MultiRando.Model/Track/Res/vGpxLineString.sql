-- Version = 5.8.15, Requires={   }

ALTER view MR.vGpxLineString as

	with vals as
	(
		SELECT t.*, Parsed = (
			select Loc.value('@lon', 'nvarchar(16)') + ' ' + Loc.value('@lat', 'nvarchar(16)') + ','
			FROM Gpx.nodes('/*:gpx/*:trk/*:trkseg/*:trkpt') as T2(Loc) 
			for xml PATH('')
		)
		from [MR].tTrack t
	)
	select TrackId, v.UserId, StrPoints = Parsed, Parsed = geometry::Parse('LINESTRING(' + SUBSTRING(Parsed, 0, LEN(Parsed) - 1) + ')')
	from vals v