import express, { Router } from 'express'
import { NgfmConnector } from '../connectors/ngfm-connector';
import multipart from 'connect-multiparty';
import post from './verbs/post';
import get from './verbs/get';
export class NgfmExpress {
    public express;

    constructor(public connector: NgfmConnector) {
        this.express = express();
    }
    public get router(): Router {
        const router = express.Router()
        router.get('/**', get(this.connector));
        router.post('/**', multipart(), post(this.connector));
        return router;
    }

}