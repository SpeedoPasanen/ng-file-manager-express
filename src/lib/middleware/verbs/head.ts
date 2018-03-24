
import { NgfmConnector } from "../../..";
import { Request } from 'express';

export default function (connector: NgfmConnector) {
    return function (req: Request | any, res, next) {
        res.set('ngfm-hash', connector.store.getHash(req.path));
        res.send();
    }
}