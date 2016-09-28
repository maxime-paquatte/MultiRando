SET PACKAGE_NAME=multirando.7z
echo ..\%PACKAGE_NAME%
7z a ..\%PACKAGE_NAME% Web.config
7z a ..\%PACKAGE_NAME% bin/*.dll
7z a ..\%PACKAGE_NAME% bin/DbSetup.exe
7z a ..\%PACKAGE_NAME% ScriptsApp/
7z a ..\%PACKAGE_NAME% Scripts/
7z a ..\%PACKAGE_NAME% ContentApp/
7z a ..\%PACKAGE_NAME% Content/
7z a ..\%PACKAGE_NAME% fonts/
7z a ..\%PACKAGE_NAME% HtmlTemplates/
7z a ..\%PACKAGE_NAME% Views/
7z a ..\%PACKAGE_NAME% CDN/content
7z a ..\%PACKAGE_NAME% CDN/scripts
7z a ..\%PACKAGE_NAME% fav.ico

PAUSE