﻿--[beginscript]	
CREATE TABLE MR.tUser 
(
	UserId			int not null IDENTITY (1,1),

	AuthId			uniqueidentifier not null constraint DF_tUser_AuthId default(NEWID()),
	Email			nvarchar(256) not null UNIQUE,
	EmailLastChange datetime2(0) not null  constraint DF_tUser_EmailLastChange default(GETUTCDATE()),	


	Passwd			 nvarchar(MAX) null,
	PasswdLastChange datetime2(0) null,

	
	LastCultureId	int not null constraint DF_tUser_LastCultureId default(9),
	
	constraint PK_tUser primary key clustered ( UserId )
)


--[endscript]