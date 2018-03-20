import { Request } from "express-serve-static-core";
import fs from 'fs';
import { NgfmConnector } from '../../connectors/ngfm-connector';
import * as pathLib from 'path';
import sanitizeFilename from 'sanitize-filename';
export default function (connector: NgfmConnector) {
    return function (req: Request | any, res, next) {
        console.log('files', req.files);
        if (req.files && req.files.file) {
            return upload(req, res, next);
        }
        // No file present, create a folder
        return mkDir(req, res, next);
    }

    function mkDir(req, res, next) {
        connector.mkDir(req.path).then(
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
        const fileName = req.path.replace(/.*\//, '');
        const path = pathLib.join(pathLib.dirname(req.path), sanitizeFilename(fileName));
        connector.uploadFile(path, file).then(
            () => {
                wrapUp(null);
            },
            err => {
                wrapUp(err);
            });
    }
}