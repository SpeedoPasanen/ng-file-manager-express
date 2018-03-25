
import { NgfmConnector } from "../../..";
import { Request } from 'express';

export default function (connector: NgfmConnector) {
    return function (req: Request, res, next) {
        connector.get(req, res, next);
    }
}