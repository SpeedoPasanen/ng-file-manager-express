import { Request } from "express-serve-static-core";
import * as fs from 'fs';
import { NgfmConnector } from '../../connectors/ngfm-connector';
import * as pathLib from 'path';
const sanitizeFilename = require('sanitize-filename');
export default function (connector: NgfmConnector) {
    return function (req: Request | any, res, next) {
        if ('from' in req.query) {
            if (!connector.store.getPathForHash(req.query.from)) {
                next(`Hash expired: ${req.query.from}`)
            }
            connector.rename(connector.store.getPathForHash(req.query.from), connector.store.getFullPath(req.path)).then(
                () => {
                    res.json({ moved: true, from: req.query.from, to: req.query.path });
                },
                err => {
                    next(err);
                }
            );
            return;
        }
        if (req.files && req.files.file) {
            return upload(req, res, next);
        }
        // No file present, create a folder
        return mkDir(req, res, next);
    }

    function mkDir(req, res, next) {
        connector.mkDir(connector.store.getFullPath(req.path)).then(
            () => {
                res.json({ created: req.path });
            },
            err => {
                next(err);
            });
    }

    function upload(req, res, next) {
        const file = req.files.file;
        const wrapUp = (hasErrored) => {
            fs.unlink(file.path, err => {
                if (err || hasErrored) {
                    return next(err || hasErrored);
                }
                if (!hasErrored) { res.json(req.files); }
            });
        };
        const fileName = decodeURI(req.path.replace(/.*\//, ''))
            .replace(/[\\\/]/g, '');
        const path = pathLib.join(pathLib.dirname(req.path), sanitizeFilename(fileName));
        connector.uploadFile(connector.store.getFullPath(path), file).then(
            () => {
                wrapUp(null);
            },
            err => {
                wrapUp(err);
            });
    }
}