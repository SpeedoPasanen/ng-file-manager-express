import express from 'express'
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
        router.get('/', (req, res) => {
            res.json({
                message: 'Hello World!'
            })
        })
        this.express.use('/', router);
        const commonRoot = path.join(__dirname, '..', '..', '..', 'dev-files');
        this.express.use('/files/private/:userId', (req, res, next) => {
            if (req.params.userId !== '1337') {
                return res.status(401).send('Unauthorized');
            }
            next();
        });
        const privateRoot = path.join(commonRoot, 'private');
        const privateConnector = new NgfmFileConnector({
            root: privateRoot,
            createRoot: true
        });
        this.express.use('/files/private', new NgfmExpress(privateConnector, {
            serveStatic: privateRoot
        }).router);

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