--[beginscript]	
CREATE TABLE MR.tSegment
(
	SegmentId		int not null identity(1,1),

	Polylines		geography  not null ,
	
	CreatorUserId	int not null,
	Creationdate	datetime2(0) not null
		constraint DF_tSegment_Creationdate default(GETUTCDATE()),
	
	constraint PK_tSegment primary key clustered ( SegmentId ),
	CONSTRAINT FK_tSegment_UserId FOREIGN KEY(CreatorUserId)
		REFERENCES [MR].[tUser](UserId)
)


--[endscript]
