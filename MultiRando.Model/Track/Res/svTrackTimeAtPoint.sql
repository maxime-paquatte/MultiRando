-- Version = 6.2.13, Requires={  }

ALTER procedure MR.svTrackTimeAtPoint
(
	@_ApplicationId	int,
	@_ActorId		int,
	@_CultureId		int,

	@TrackId int,
	@Lat decimal(16,12),
	@Lon decimal(16,12)
)
as begin
--[beginsp]

	declare @startTime datetime2(0), @pointTime datetime2(0);
	select top 1 @startTime = PointTime from [MR].[tTrackPoint]
	where TrackId = @TrackId order by Idx;
	

	SELECT top 1 startTime = @startTime, NbSeconds = DATEDIFF(second, @startTime, t.PointTime), t.*
	FROM [MR].tTrackPoint t WHERE t.TrackId = @TrackId 
	order by SQRT(POWER(69.1 * (Lat - @Lat), 2) +
			POWER(69.1 * (@Lon - Lon) * COS(Lat / 57.3), 2)) 
			
	FOR XML PATH('data'), root('data'),  ELEMENTS, TYPE

--[endsp]
end
