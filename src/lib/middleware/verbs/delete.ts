
import { NgfmConnector } from "../../..";
import { Request } from 'express';

export default function (connector: NgfmConnector) {
    return function (req: Request | any, res, next) {
        connector.rm(connector.store.getFullPath(req.path)).then(
            () => res.json({ deleted: req.path }),
            error => next(error)
        );
    }
}