set DIR=%~dp0

%DIR%MultiRando.Web\bin\DbSetup.exe "Server=.;Database=multirando;Integrated Security=True" %DIR%

PAUSE