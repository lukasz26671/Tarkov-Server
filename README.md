# Server Readme.md

## Current Tarkov Version (working)
- 0.12.12.15.17861

## Debugging
- Download and Install [Visual Studio Code](https://code.visualstudio.com/) 
- Open the Directory (can be done in several ways)
- Press F5 to Debug

## Compiling to Windows EXE, Linux or MacOS
- Open GitBash
- Execute pkg .
- Wait until JustEmuTarkov-win.exe, JustEmuTarkov-linux, JustEmuTarkov-macos appear

## Distribution
Zip the following folders & files

- core (this is likely unwanted but pkg is not handling this correctly yet)
- db
- docs
- node_modules
- res
- src
- user
- Server.exe

## How to host this server to others (this may change soon)
- Open port 7777 on your router
- Open user/configs/server.json and change port value to 7777 (this can anything but this is a good easily memorable open one to use)
- Open user/configs/server.json and change ip value to your internal IP (google to find out how to find it)
- Open user/configs/server.json and change ip_backend value to your external IP (google to find out how to find it)
- Run the Server
- Provide your friends with your external IP address and port
 