
import { NgfmConnector } from "../../..";
import { Request } from 'express';

export default function (connector: NgfmConnector) {
    return function (req: Request | any, res, next) {
        const hash = connector.store.getHash(req.path);
        res.set('content-type', 'application/' + hash).send();
    }
}