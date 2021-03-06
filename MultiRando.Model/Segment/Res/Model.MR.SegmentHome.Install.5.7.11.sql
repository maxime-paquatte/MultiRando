﻿--[beginscript]	


CREATE TABLE MR.tSegment 
(
	SegmentId		int not null IDENTITY(1,1),
	CreatorId		int not null,
	Polylines		geography null ,
	LineString		geometry null ,

	IsPublic		bit	not null constraint DF_tSegment_IsPublic DEFAULT(0),

	CreationDate	datetime2(0) not null
		constraint DF_tSegment_CreationDate DEFAULT(GETUTCDATE()),

	ActivityFlag int not null constraint DF_tSegment_ActivityFlag default 0,
	Mudding tinyint  not null constraint DF_tSegment_Mudding default 0,
	Elevation tinyint  not null constraint DF_tSegment_Elevation default 0,
	Scree tinyint  not null constraint DF_tSegment_Scree default 0,
	
	IsPrivate bit not null constraint DF_tSegment_IsPrivate default 0,
	IsRoad bit not null constraint DF_tSegment_IsRoad default 0,
	NoWay bit not null constraint DF_tSegment_NoWay default 0,

	
	TrackId		int null,	

	constraint PK_tSegment primary key clustered ( SegmentId ),
	CONSTRAINT FK_tSegment_TrackId FOREIGN KEY(TrackId)
		REFERENCES [MR].tTrack(TrackId),
	CONSTRAINT FK_tSegment_UserId FOREIGN KEY(CreatorId)
		REFERENCES [MR].[tUser](UserId)
)



--[endscript]
