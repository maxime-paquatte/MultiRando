-- Version = 6.2.13, Requires={  }

ALTER procedure MR.svTrackPointAtTime
(
	@_ApplicationId	int,
	@_ActorId		int,
	@_CultureId		int,

	@TrackId int,
	@NbSeconds int
)
as begin
--[beginsp]

	declare @startTime datetime2(0), @pointTime datetime2(0);
	select top 1 @startTime = PointTime from [MR].[tTrackPoint]
	where TrackId = @TrackId order by Idx

	set @pointTime = DATEADD(second, @NbSeconds, @startTime);

	select top 1 startTime = @startTime, pointTime = @pointTime, t.*
	from [MR].tTrackPoint t
	where t.TrackId = @TrackId AND PointTime < @pointTime
	order by Idx DESC
			
	FOR XML PATH('data'), root('data'),  ELEMENTS, TYPE

--[endsp]
end
