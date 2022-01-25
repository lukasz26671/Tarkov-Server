# Server Readme.md
  
## Running the server under linux
- Install node version 16.x either via docker or directly by using `curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -` and `sudo apt-get install -y nodejs`.
- After node is installed, grab a copy from git and put it on your machine.
- Run the command `npm install` to install all dependencies.
- To start the server, use the command `npm start`.

_If you run the server as an user, you might run into issues with using ports below port 1024. To use ports below 1024, run the server using sudo. Otherwise, edit the user/config/server.json_
