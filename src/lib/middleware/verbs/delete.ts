
import { NgfmConnector } from "../../..";
import { Request } from 'express';

export default function (connector: NgfmConnector) {
    return function (req: Request | any, res, next) {
        connector.rm(req.path).then(
            () => res.json({ deleted: req.path }),
            error => next(error)
        );
    }
}