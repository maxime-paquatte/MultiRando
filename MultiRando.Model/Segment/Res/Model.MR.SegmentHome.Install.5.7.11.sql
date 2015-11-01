--[beginscript]	

CREATE TABLE MR.tSegment 
(
	SegmentId			int not null IDENTITY(1,1),
	UserId			int not null,
		
	Name			varchar(128) not null,
	Polylines		geography null ,

	PathLength		int not null constraint DF_tSegment_PathLength DEFAULT(0),
	IsPublic		bit	not null constraint DF_tSegment_IsPublic DEFAULT(0),
	Comment			varchar(MAX) not null constraint DF_tSegment_Comment DEFAULT(''),

	CreationDate	datetime2(0) not null
		constraint DF_tSegment_CreationDate DEFAULT(GETUTCDATE()),

	constraint PK_tSegment primary key clustered ( SegmentId ),
	CONSTRAINT FK_tSegment_UserId FOREIGN KEY(UserId)
		REFERENCES [MR].[tUser](UserId)
)


--[endscript]
