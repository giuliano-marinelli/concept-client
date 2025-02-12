# Concept

_On this project we had the **frontend** code._

It's an [Angular](https://angular.io/) project that is served by the [concept-server](https://github.com/giuliano-marinelli/concept-server) via [Express](https://expressjs.com).

## Setup

1. Install [Node.js](https://nodejs.org)
2. Install [pnpm](https://pnpm.io): `npm install -g pnpm@latest`
3. Install [Angular CLI](https://angular.io/cli): `npm install -g @angular/cli`
4. From project root folder install all the dependencies: `pnpm install`
5. To be served by [concept-server](https://github.com/giuliano-marinelli/concept-server), it must be located at sibling folder of this project, as shown:

```
concept
└─ concept-client
└─ concept-server
   └─ uploads (this is where server saves users uploaded files)
```

## Run

### Development

Run `pnpm start`: execute [ng serve](https://angular.io/cli/serve) that makes a virtual server on memory and host Angular page at [localhost:4200](http://localhost:4200). Any change automatically creates a new bundle and restart client. _(**Note:** with this command you will not be able to do queries to [concept-server](https://github.com/giuliano-marinelli/concept-server) because this won't generate **dist** folder to be served by [concept-server](https://github.com/giuliano-marinelli/concept-server) and so the projects will not be at same path)_

Run `pnpm watch`: execute [ng build](https://angular.io/cli/build) with Watch mode, it generates **dist** folder at the project root folder. You need to execute [concept-server](https://github.com/giuliano-marinelli/concept-server) too for see Angular page hosted by it at [localhost:3000](http://localhost:3000). Any change automatically creates a new bundle and restart client.

### Development of [@dynamic-glsp](https://www.npmjs.com/settings/dynamic-glsp/packages) all-in-one

For develop [concept-client](https://github.com/giuliano-marinelli/concept-client) along with their main packages [@dynamic-glsp/client](https://www.npmjs.com/package/@dynamic-glsp/client) and [@dynamic-glsp/protocol](https://www.npmjs.com/package/@dynamic-glsp/protocol). It packages must be located along side concept project, as shown:

```
concept
└─ concept-client
└─ concept-server

@dynamic-glsp
└─ client
└─ server
└─ protocol
```

If packages are not available locally it will use the registry uploaded ones.
Only if the packages are available locally you can use the next command:

Run `pnpm watch:all`: execute `concurrently` watch mode over [concept-client](https://github.com/giuliano-marinelli/concept-client), [@dynamic-glsp/client](https://www.npmjs.com/package/@dynamic-glsp/client) and [@dynamic-glsp/protocol](https://www.npmjs.com/package/@dynamic-glsp/protocol). Any changes on sub-packages re-compiles them and re-install them on client, and re-compile and restart client.

### Production

Run `pnpm build`: executes [ng build](https://angular.io/cli/build), it generates **dist** folder at the project root folder. Then it can be served by [concept-server](https://github.com/giuliano-marinelli/concept-server).
