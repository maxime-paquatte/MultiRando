--[beginscript]	
CREATE TABLE MR.tRoute 
(
	RouteId			int not null IDENTITY(1,1),
	UserId			int not null,
		
	Name			varchar(128) not null,
	Polylines		geography null ,

	CreationDate	datetime2(0) not null
		constraint DF_tRoute_CreationDate DEFAULT(GETUTCDATE()),

	constraint PK_tRoute primary key clustered ( RouteId ),
	CONSTRAINT FK_tRoute_UserId FOREIGN KEY(UserId)
		REFERENCES [MR].[tUser](UserId)
)


--[endscript]
