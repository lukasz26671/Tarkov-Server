# Tarkov Emulated Central Server

## Current known working Tarkov Version
- 0.12.12.15.*

## Debugging
- Download and Install [Visual Studio Code](https://code.visualstudio.com/) 
- Open the Directory (can be done in several ways)
- Press F5 to Debug

## Compiling to Windows EXE, Linux or MacOS
- Open VS Code Terminal or Open GitBash on Directory
- Execute pkg .
- Wait until Server.exe appears / Process completes

## Distribution
Zip the following folders & files

- core (this is likely unwanted but pkg is not handling this correctly yet)
- db
- dbViewer
- express
- node_modules
- out
- public
- res
- src
- user
- Server.exe

## How to use (if not compiling yourself or using a release)
- Download the latest release
- Ensure the code and the Server.exe are in the same folder
- Run Server.exe

## How to host this server to others (this may change soon)
- Open port 7777 on your router
- Open user/configs/server.json and change port value to 7777 (this can anything but this is a good easily memorable open one to use)
- Open user/configs/server.json and change ip value to your internal IP (google to find out how to find it)
- Open user/configs/server.json and change ip_backend value to your external IP (google to find out how to find it)
- Run the Server
- Provide your friends with your external IP address and port

## Features
- A modified Tarkov experience where you can host your own server and play alone or with others (working Client also required see [SIT.Tarkov.Launcher](https://github.com/paulov-t/SIT.Tarkov.Launcher) for details)
- A set of configurations to tailor your gameplay
- Airdrops (must have accompanying BepInEx plugin)
- AI PMCs
- Listens to extra Client Events
- JET Mod Support
- SPT-Aki Mod Support - *In Progress*
- Client sends more events to the Server - *In Progress*

## Known working Server mods
- [SIT M4](https://github.com/paulov-t/SIT-Mod-M4) - Makes the M4 actually useful and good mod to show how to make changes of your own.
- [SIT AI](https://github.com/paulov-t/SIT.ServerMod.AI) - Makes all AI move around, be more aggressive and generally make the game much harder.
- [SamSwat Benelli M4-Super-90 (m1014) - New Weapon](https://hub.sp-tarkov.com/files/file/261-l85-sa80-a2-british-assault-rifle/)
- [SamSwat L85 SA80 AR - New Weapon](https://hub.sp-tarkov.com/files/file/181-benelli-m4-super-90-m1014/)
- [Nehax MagazineManiac](https://github.com/Nehaxfr/Nehax-MagazineManiac)

## Documentation
*This is Work in Progress*
- Documentation can be auto generated using ``npm run generate-docs .``
- You can run the server and discover the generated docs at https://localhost:443/out or https://localhost:443/docs

## DB Viewer
*This is Work in Progress*
- You can find the DBViewer at https://localhost:443/db

 