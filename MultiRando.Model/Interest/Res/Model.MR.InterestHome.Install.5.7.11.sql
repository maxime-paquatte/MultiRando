--[beginscript]	
CREATE TABLE MR.tInterest
(
	InterestId		int not null identity(1,1),

	ActivityFlag int not null constraint DF_tInterest_ActivityFlag default 0,
	Mudding tinyint  not null constraint DF_tInterest_Mudding default 0,
	Elevation tinyint  not null constraint DF_tInterest_Elevation default 0,
	Scree tinyint  not null constraint DF_tInterest_Scree default 0,


	Polylines		geography  not null ,

	
	CreatorUserId	int not null,
	Creationdate	datetime2(0) not null
		constraint DF_tInterest_Creationdate default(GETUTCDATE()),
	
	constraint PK_tInterest primary key clustered ( InterestId ),
	CONSTRAINT FK_tInterest_UserId FOREIGN KEY(CreatorUserId)
		REFERENCES [MR].[tUser](UserId)
)


--[endscript]
