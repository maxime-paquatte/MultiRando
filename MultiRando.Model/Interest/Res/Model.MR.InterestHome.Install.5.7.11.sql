﻿--[beginscript]	

CREATE TABLE MR.tInterest
(
	InterestId		int not null identity(1,1),

	Lat float not null,
	Lon float not null,

	Category varchar(16) not null,
	Comment nvarchar(256) not null
		constraint DF_tInterest_Comment default(''),

	IsPublic bit not null
		constraint DF_tInterest_IsPublic default(1),


	
	CreatorUserId	int not null,
	CreationDate	datetime2(0) not null
		constraint DF_tInterest_Creationdate default(GETUTCDATE()),
	
	constraint PK_tInterest primary key clustered ( InterestId ),
	CONSTRAINT FK_tInterest_UserId FOREIGN KEY(CreatorUserId)
		REFERENCES [MR].[tUser](UserId)
)


--[endscript]


--[beginscript]	

CREATE TABLE MR.tInterestMedia
(
	InterestMediaId		int not null identity(1,1),

	InterestId int not null,

	MediaType varchar(32) not null,
	Value nvarchar(MAX) not null,
	
	CreatorUserId	int not null,
	CreationDate	datetime2(0) not null
		constraint DF_tInterestMedia_Creationdate default(GETUTCDATE()),
	
	constraint PK_tInterestMedia primary key clustered ( InterestMediaId ),
	CONSTRAINT FK_tInterestMedia_InterestId FOREIGN KEY(InterestId)
		REFERENCES [MR].tInterest(InterestId),
	CONSTRAINT FK_tInterestMedia_UserId FOREIGN KEY(CreatorUserId)
		REFERENCES [MR].[tUser](UserId)
)
--[endscript]