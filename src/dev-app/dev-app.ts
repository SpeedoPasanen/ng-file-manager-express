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
        this.express.use('/files', express.static(commonRoot));
        this.express.use('/files/private/:userId', (req, res, next) => {
            if (req.params.userId !== '1337') {
                return res.status(401).send('Unauthorized');
            }
            next();
        });
        const privateConnector = new NgfmFileConnector({
            root: path.join(commonRoot, 'private')
        });
        this.express.use('/files/private', new NgfmExpress(privateConnector).router);

        const publicConnector = new NgfmFileConnector({
            root: path.join(commonRoot, 'public')
        });
        this.express.use('/files/public', new NgfmExpress(privateConnector).router);
    }
}

export default new DevApp().express