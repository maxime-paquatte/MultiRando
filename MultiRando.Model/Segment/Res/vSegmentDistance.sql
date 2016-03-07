-- Version = 6.2.13, Requires={ }
ALTER VIEW MR.vSegmentDistance as
	select A = a.SegmentId, B = b.SegmentId, 
		toStart = a.LineString.STStartPoint( ).STDistance (b.LineString.STStartPoint( )), 
		toEnd =   a.LineString.STStartPoint( ).STDistance (b.LineString.STEndPoint( ))
	from MR.tSegment a
	cross join MR.tSegment b
	where a.SegmentId != b.SegmentId