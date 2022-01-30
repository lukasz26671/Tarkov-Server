# Server Readme.md
  
## Running the server under linux
- Install node version 16.x either via docker or directly by using `curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -` and `sudo apt-get install -y nodejs`.
- After node is installed, grab a copy from git and put it on your machine.
- Run the command `npm install` to install all dependencies.
- To start the server, use the command `npm start`.

_If you run the server as an user, you might run into issues with using ports below port 1024. To use ports below 1024, run the server using sudo. Otherwise, edit the user/config/server.json_

## Git Guide

### Current Branches:
[AE-Backend-Server/develop](https://github.com/KovacsAltered-State/AE-Backend-Server/tree/develop): Dedicated server build, primary branch for bugfixes and live testing.

[AE-Backend-Server/main](https://github.com/KovacsAltered-State/AE-Backend-Server/tree/main): Main branch only for long-term new feature development and basing release branches.

Except for long-term feature work that is not ready to be tested, ALL FIXES AND NEW CODE should start in either [develop](https://github.com/KovacsAltered-State/AE-Backend-Server/tree/develop) or a feature branch off of [develop](https://github.com/KovacsAltered-State/AE-Backend-Server/tree/develop). DO NOT USE [main](https://github.com/KovacsAltered-State/AE-Backend-Server/tree/main) for anything but creating release branches and long-term work that is not ready for user testing.

[develop](https://github.com/KovacsAltered-State/AE-Backend-Server/tree/develop) should be regularly merged back into [main](https://github.com/KovacsAltered-State/AE-Backend-Server/tree/main) so that the main branch and future features/versions will include the work done on develop.

```git checkout main
git pull
git pull origin develop
```

### Git Branch Guide
Large/complex bugfixes should be branched from [develop](https://github.com/KovacsAltered-State/AE-Backend-Server/tree/develop) and merged back into develop with a PR or a merge. (Small bugfixes can be pushed directly to develop).

```git checkout develop
git pull
git checkout -b bugfix-name
git push --set-upstream origin bugfix-name

<...work, eventually ready to merge...>

git pull origin develop
<...fix any merge conflicts, commit and push...>

git checkout develop
git pull
git pull origin bugfix-name
```

All new release versions should be branched from [main](https://github.com/KovacsAltered-State/AE-Backend-Server.git).

```git checkout main
git pull
git checkout -b release-2.x.x
git push --set-upstream origin release-2.x.x
```
