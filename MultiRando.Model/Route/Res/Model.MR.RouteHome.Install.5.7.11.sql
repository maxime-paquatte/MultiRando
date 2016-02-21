--[beginscript]	
CREATE TABLE MR.tRoute
(
	RouteId		int not null identity(1,1),
	Name		nvarchar(256) not null,
	ActivityFlag int not null 
		constraint DF_tRoute_ActivityFlag default 0,

	LineString		geometry  not null ,
	RouteLength		int not null
		constraint DF_tRoute_RouteLength default(0),
	
	IsPublic	bit not null
		constraint DF_tRoute_IsPublic default(0),
	
	CreatorUserId	int not null,
	Creationdate	datetime2(0) not null
		constraint DF_tRoute_Creationdate default(GETUTCDATE()),
	
	constraint PK_tRoute primary key clustered ( RouteId ),
	CONSTRAINT FK_tRoute_UserId FOREIGN KEY(CreatorUserId)
		REFERENCES [MR].[tUser](UserId)
)

--[endscript]
