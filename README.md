# Concept

_On this project we had the **frontend** code._

It's a [Angular](https://angular.io/) project that is served by the [concept-server](https://github.com/giuliano-marinelli/concept-server) via [Express](https://expressjs.com).

## Setup

1. Install [Node.js](https://nodejs.org)
2. Install [Angular CLI](https://angular.io/cli): `npm install -g @angular/cli`
3. From project root folder install all the dependencies: `npm install`
4. To be served by [concept-server](https://github.com/giuliano-marinelli/concept-server), it must be located at sibling folder of this project, as shown:

```
concept
└─ concept-client
└─ concept-server
   └─ uploads (this is where server saves users uploaded files)
```

## Run

### Development

Run `npm start`: execute [ng serve](https://angular.io/cli/serve) that makes a virtual server on memory and host Angular page at [localhost:4200](http://localhost:4200). Any change automatically creates a new bundle and restart client. _(**Note:** with this command you will not be able to do queries to [concept-server](https://github.com/giuliano-marinelli/concept-server) because this won't generate **dist** folder to be served by [concept-server](https://github.com/giuliano-marinelli/concept-server) and so the projects will not be at same path)_

Run `npm run watch`: execute [ng build](https://angular.io/cli/build) with Watch mode, it generates **dist** folder at the project root folder. You need to execute [concept-server](https://github.com/giuliano-marinelli/concept-server) too for see Angular page hosted by it at [localhost:3000](http://localhost:3000). Any change automatically creates a new bundle and restart client.

### Production

Run `npm run build`: executes [ng build](https://angular.io/cli/build), it generates **dist** folder at the project root folder. Then it can be served by [concept-server](https://github.com/giuliano-marinelli/concept-server).
