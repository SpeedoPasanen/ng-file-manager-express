# ng-filemanager-express

Express app/middleware for ng-file-manager

## What it is

- An out-of-the-box Express backend for [ng-file-manager](https://github.com/funkizer/ng-file-manager) (an Angular File Manager)
- Easily swappable connectors
    - Filesystem: NgfmFileConnector (implemented)
        - Creates thumbnails and previews automatically from images
    - Popular cloud services (todo)
    - Make your own? Easy. Publish it on NPM? <3
- Simple and easy-to-secure REST api
- Plays nice with other Express middleware and any Express-based framework that allows the use of your own middleware, eg. Loopback, NestJS, ...
- A pet project by a full-time full-stack dev, done on nights and weekends. Got so much from the Angular&Node communities, figured it's my time to give back.
- Github: [ng-file-manager-express](https://github.com/funkizer/ng-file-manager-express)

## Demo
- [ng-file-manager](https://funkizer.github.io)
    - Doesn't actually use any backend, uses the built-in memory connector, nothing persisted.

## What it's not
- A complete framework. You'll need to implement at least some form of user authentication to keep things safe & sane.

## TODO
- More examples, documentation & demos

## Contact & questions
Give me a shout at Gitter:

[![ng-file-manager Gitter https://gitter.im/ng-file-manager/Lobby](https://badges.gitter.im/ng-file-manager/Lobby.svg)](https://gitter.im/ng-file-manager/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Work in progress
Testing is mid-way and although unlikely, some breaking changes might come. Likely this however will only affect you if you decide to make your own connector. REST API will not see breaking changes.

## REST API
- GET `/path/to/middleware/folder`
    - List files and folders
- GET `/path/to/middleware/folder/x.jpg`
    - Serve static file (default, can be disabled)
- POST `/path/to/middleware/folder/x.jpg`
    - Upload `x.jpg` to `folder`
    - FormData needs to have the file in the key `file`
- HEAD `/path/to/middleware/folder/x.jpg`
- HEAD `/path/to/middleware/folder`
    - Get a unique, timestamped hash for the file or folder, presented in the header `ngfm-hash`
- POST `/path/to/middleware/folder/x2.jpg?from=fileHash_abc123`
- POST `/path/to/middleware/folder2?from=folderHash_abc123`
    - Move the file or folder associated to a hash acquired from HEAD into the path of this POST request.
    - You have a few minutes to do this after retrieving the hash via HEAD, before the hash expires.
    - This way of moving/renaming makes it very simple to secure moving files from one folder to another. All your guards need to ever only look at the request URL.

## Usage
Examples are in TS. For JS, basically you should only need to remove types and replace 

`import { X } from 'ng-file-manager-express;` 

with -->

`const { X } = require('ng-file-manager-express');`

### dev-app.ts

```
import express from 'express'
import * as path from 'path';
import { NgfmFileConnector } from 'ngfm-file-manager-express';
import { NgfmExpress } from 'ngfm-file-manager-express';
class DevApp {
    public express

    constructor() {
        this.express = express()
        this.mountRoutes()
    }

    private mountRoutes(): void {
        const router = express.Router()
        router.get('/', (req, res) => { res.json({ message: 'Hello World!' }) });
        this.express.use('/', router);

        /**
         * Create a root for private user files.
         */
        const commonRoot = path.join(__dirname, 'dev-files');
        const privateRoot = path.join(commonRoot, 'private');
        const privateConnector = new NgfmFileConnector({
            root: privateRoot,
            createRoot: true
        });

        /**
         *  Only an authenticated user with the correct userId can access/modify.
         *  This is where your own Auth middleware would need to step in and check the user.
         */
        this.express.use('/files/private/:userId', (req, res, next) => {
            if (req.params.userId !== '1337') {
                return res.status(401).send('Unauthorized');
            }
            next();
        });
        this.express.use('/files/private', new NgfmExpress(privateConnector, {
            serveStatic: privateRoot
        }).router);

        /**
         * Create a public root
         */
        const publicRoot = path.join(commonRoot, 'public');
        const publicConnector = new NgfmFileConnector({
            root: publicRoot,
            createRoot: true
        });
        this.express.use('/files/public', new NgfmExpress(publicConnector, {
            serveStatic: publicRoot
        }).router);
    }
}

export default new DevApp().express
```

### index.ts

```
import app from './dev-app'
const port = process.env.PORT || 3000
app.listen(port, (err) => {
    if (err) {
        return console.log(err);
    }
    return console.log(`server is listening on ${port}`);
})
```