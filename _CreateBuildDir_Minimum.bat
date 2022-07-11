rmdir Build /s/q
mkdir Build

copy "Server.exe" "Build/Server.exe"
xcopy "db" "Build/db/" /s/i/y
xcopy "res" "Build/res/" /s/i/y
xcopy "user" "Build/user/" /s/i/y

rmdir "Build/user/cache/" /s/q
rmdir "Build/user/events/" /s/q
rmdir "Build/user/logs/" /s/q
rmdir "Build/user/profiles/" /s/q
rmdir "Build/user/mods" /s/q

del "Build\user\configs\gameplay.json" /q
del "Build\user\configs\server.json" /q

pause