# leafal.io Desktop
The official desktop application for leafal.io, used to access the store, view profiles, download and play games.

# WARNING
This application is early in development. Don't expect much, please report issues within our discord server (Morgan: owner and Kearfy: main dev of this repo): https://discord.gg/RucfrYaWnX

# Running Development Builds
The content below describes requirements, preparations and necessary NPM commands for running development builds of leafal.io Desktop.

## Requirements
- NodeJS 14*
- NPM (included with NodeJS)

## Preparations
- Create `.env` file with public key. (Use `.env-example` as an template)
- run `npm install` in the root directory
- start the application with `npm run dev`

## NPM commands
- `npm run start`: Compiles the application in folder "build" and launches it.
- `npm run dev`: Compiles the application in folder "build" and launches it, but in a dev environment.
- `npm run cleanbuild`: Deletes the "build" directory
- `npm run copysource`: Copies all source files to the build directory
- `npm run preparebuild`: Combines cleanbuild and copysource
- `npm run build`: runs preparebuild and compiles all the typescript code into native Javascript
- `npm run buildonly`: Only compiles the typescript code into native Javascript. (Within the build directory)
- `npm run startonly`: Starts the application without rebuilding or compiling the typescript code.
- `npm run startbasic`: Compiles the typescript in the build directory and starts the application.
