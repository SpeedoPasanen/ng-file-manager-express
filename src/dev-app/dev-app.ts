const express = require('express');
import * as path from 'path';
import { NgfmFileConnector } from '../lib/connectors/ngfm-file-connector';
import { NgfmExpress } from '../lib/middleware/ngfm-express';
const cors = require('cors');
class DevApp {
    public app

    constructor() {
        this.app = express();
        this.app.use(cors());
        this.mountRoutes();
    }

    private mountRoutes(): void {
        const router = express.Router()
        router.get('/', (req, res) => { res.json({ message: 'Hello World!' }) });
        this.app.use('/', router);

        /**
         * Create a root for private user files.
         */
        const commonRoot = path.join(__dirname, '..', '..', '..', 'dev-files');
        const privateRoot = path.join(commonRoot, 'private');
        const privateConnector = new NgfmFileConnector({
            root: privateRoot,
            createRoot: true,
            serveStatic: true
        });

        /**
         *  Only an authenticated user with the correct userId can access/modify.
         *  This is where your own Auth middleware would need to step in and check the user.
         */
        this.app.use('/files/private/:userId', (req, res, next) => {
            if (req.params.userId !== '1337') {
                return res.status(401).send('Unauthorized');
            }
            next();
        });
        this.app.use('/files/private', new NgfmExpress(privateConnector).router);

        /**
         * Create a public root
         */
        const publicRoot = path.join(commonRoot, 'public');
        const publicConnector = new NgfmFileConnector({
            root: publicRoot,
            createRoot: true,
            serveStatic: true
        });
        this.app.use('/files/public', new NgfmExpress(publicConnector).router);
    }
}

export default new DevApp().app