
import { NgfmConnector } from "../../..";
import { Request } from 'express';

export default function (connector: NgfmConnector) {
    return function (req: Request | any, res, next) {
        const hash = connector.store.getHash(req.path);
        res.set('Access-Control-Expose-Headers', 'X-NGFM-Hash')
            .set('X-NGFM-Hash', hash)
            .send();

    }
}