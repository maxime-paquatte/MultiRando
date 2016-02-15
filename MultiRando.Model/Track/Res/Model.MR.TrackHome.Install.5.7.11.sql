--[beginscript]	
CREATE TABLE MR.tTrack
(
	TrackId		int not null identity(1,1),	
	UserId	int not null,
	
	Name		nvarchar(128),
	Gpx		xml,
		
	Creationdate	datetime2(0) not null
		constraint DF_tTrack_Creationdate default(GETUTCDATE()),
	
	constraint PK_tTrack primary key clustered ( TrackId ),
	CONSTRAINT FK_tTrack_UserId FOREIGN KEY(UserId)
		REFERENCES [MR].[tUser](UserId)
)


--[endscript]
