--[beginscript]	
CREATE TABLE MR.tUserSettings 
(
	UserId			int not null,

	MapCenter		geography  not null 
		constraint DF_tUserSettings_MapCenter default(geography::Point(46.398326631537465, 2.9740600051879973, 4326)),
	MapZoom			tinyint not null 
		constraint DF_tUserSettings_MapZoom default(9),
	MapTypeId			varchar(128) not null 
		constraint DF_tUserSettings_MapTypeId default('satellite'),

	Activity	int not null
		constraint DF_tUserSettings_Activity default(0),
	
	constraint PK_tUserSettings primary key clustered ( UserId ),
	CONSTRAINT FK_tUserSettings_UserId FOREIGN KEY(UserId)
		REFERENCES [MR].[tUser](UserId)
)


--[endscript]
