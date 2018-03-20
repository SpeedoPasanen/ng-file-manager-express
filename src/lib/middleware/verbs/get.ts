import { Request } from "express-serve-static-core";
import { NgfmConnector } from "../../..";

export default function (connector: NgfmConnector) {
    return function (req: Request | any, res, next) {
        connector.ls(req.path).then(
            data => res.json(data),
            error => next(error)
        );
    }
}