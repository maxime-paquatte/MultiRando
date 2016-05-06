--[beginscript]	
CREATE TABLE MR.tTrack
(
	TrackId		int not null identity(1,1),	
	UserId		int not null,
	
	Name		nvarchar(128),
	Gpx			xml,
	Plt			nvarchar(MAX),
		
	Creationdate	datetime2(0) not null
		constraint DF_tTrack_Creationdate default(GETUTCDATE()),
				
	LineString		geometry  not null ,
	
	constraint PK_tTrack primary key clustered ( TrackId ),
	CONSTRAINT FK_tTrack_UserId FOREIGN KEY(UserId)
		REFERENCES [MR].[tUser](UserId)
)


--[endscript]


--[beginscript]	
CREATE TABLE MR.tTrackPoint
(
	TrackId		int not null,
	Idx			int not null,

	Lat		float not null,
	Lon		float not null,
	Elevation	float null,
	PointTime datetime2(0),
		
	constraint PK_tTrackPoint primary key clustered ( TrackId, Idx ),
	CONSTRAINT FK_tTrackPoint_TrackId FOREIGN KEY(TrackId)
		REFERENCES [MR].tTrack(TrackId)
)


--[endscript]
