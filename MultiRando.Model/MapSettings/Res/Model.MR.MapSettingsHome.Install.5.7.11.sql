--[beginscript]	
CREATE TABLE MR.tMapSettings 
(
	UserId			int not null,

	MapCenter		geography  not null 
		constraint DF_tMapSettings_MapCenter default(geography::Point(46.398326631537465, 2.9740600051879973, 4326)),
	MapZoom			tinyint not null 
		constraint DF_tMapSettings_MapZoom default(9),
	MapTypeId			varchar(128) not null 
		constraint DF_tMapSettings_MapTypeId default('satellite'),
	
	constraint PK_tMapSettings primary key clustered ( UserId ),
	CONSTRAINT FK_tMapSettings_UserId FOREIGN KEY(UserId)
		REFERENCES [MR].[tUser](UserId)
)


--[endscript]

--[beginscript]	
insert into [MR].[tMapSettings] (UserId) values (1)
--[endscript]
