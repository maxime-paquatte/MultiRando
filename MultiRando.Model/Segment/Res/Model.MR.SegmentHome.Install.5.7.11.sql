--[beginscript]	
CREATE TABLE MR.tSegment
(
	SegmentId		int not null identity(1,1),

	ActivityFlag int not null constraint DF_tSegment_ActivityFlag default 0,
	Mudding tinyint  not null constraint DF_tSegment_Mudding default 0,
	Elevation tinyint  not null constraint DF_tSegment_Elevation default 0,
	Scree tinyint  not null constraint DF_tSegment_Scree default 0,


	Polylines		geography  not null ,

	
	CreatorUserId	int not null,
	Creationdate	datetime2(0) not null
		constraint DF_tSegment_Creationdate default(GETUTCDATE()),
	
	constraint PK_tSegment primary key clustered ( SegmentId ),
	CONSTRAINT FK_tSegment_UserId FOREIGN KEY(CreatorUserId)
		REFERENCES [MR].[tUser](UserId)
)


--[endscript]
