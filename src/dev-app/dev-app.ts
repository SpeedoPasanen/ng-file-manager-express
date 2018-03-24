const express = require('express');
import * as path from 'path';
import { NgfmFileConnector } from '../lib/connectors/ngfm-file-connector';
import { NgfmExpress } from '../lib/middleware/ngfm-express';
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
        const commonRoot = path.join(__dirname, '..', '..', '..', 'dev-files');
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