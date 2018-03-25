import { Request, Response } from "express";
import * as fs from 'fs-extra';
const sharp = require('sharp');
const findRemoveSync = require('find-remove');
import { NgfmBaseConnector } from '../connectors/ngfm-base-connector';
export class NgfmImage {
    private cacheDir: string;
    constructor(private connector: NgfmBaseConnector) {
        this.cacheDir = connector.store.getFullPath('.cache');
        this.cleanCache();
        setInterval(this.cleanCache.bind(this), 1000 * 60 * 60 * 12);
    }
    /**
     * Remove cache files older than a few days
     */
    cleanCache() {
        findRemoveSync(this.cacheDir, { files: '*.*', age: { seconds: 60 * 60 * 24 * 2 } });
    }
    middleware(req: Request, res: Response, next) {
        const size = req.query.s === 't' ? { w: 240, h: 240 } : { w: 900, h: 600 };
        const origPath = this.connector.store.getFullPath(req.path);
        const cachePath = this.connector.store.getFullPath('.cache',
            `${size.w}x${size.h}${req.path.replace(/\//g, '_')}`
        );
        fs.exists(cachePath, exists => {
            if (exists) {
                return res.sendFile(cachePath);
            }
            // const mime = String(mimeTypes.lookup(origPath));
            // ToDo: Let user configure 'file handlers', provide one for PDF using eg. Imagick             
            fs.ensureDir(this.cacheDir, err => {
                if (err) {
                    return next(err);
                }
                this.wrapUp(origPath, cachePath, size, res, next);
            });
        });
    }
    private wrapUp(origPath, cachePath, size, res, next) {
        return this.resize(origPath, cachePath, size).then(() => res.sendFile(cachePath), err => next(err));
    }
    resize(path: string, cachePath: string, size: { w: number, h: number }): Promise<string> {
        return new Promise((resolve, reject) => {
            sharp(path)
                .resize(size.w, size.h)
                .withoutEnlargement()
                .toFile(cachePath, (err, info) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(cachePath);
                });
        });
    }
}