
import * as fs from 'fs-extra';
import * as pathLib from 'path';
import * as mimeTypes from 'mime-types';
const rimraf = require('rimraf');
import { NgfmBaseConnector } from './ngfm-base-connector';
import { NgfmConnector } from './ngfm-connector';
import { NgfmFile } from '../models/ngfm-file';
import { NgfmFolder } from '../models/ngfm-folder';
import { NgfmItem } from '../models/ngfm-item';
import { NgfmConnectorConfig } from './ngfm-connector.config';
import { Request, Response } from 'express';
import { NgfmImage } from '../util/ngfm-image';
const express = require('express');
export class NgfmFileConnector extends NgfmBaseConnector implements NgfmConnector {
    config: NgfmConnectorConfig;
    image: NgfmImage;
    constructor(config: NgfmConnectorConfig) {
        super(config);
        if (!fs.existsSync(config.root)) {
            if (config.createRoot) {
                fs.ensureDir(config.root, err => {
                    if (err) { throw err; }
                    console.log(`Created: ${config.root}`);
                });
            } else {
                throw Error(`${config.root} does not exist. Set config.createRoot to true or create the root directory first.`);
            }
        }
        if (config.serveStatic) { this.image = new NgfmImage(this); }
        console.log(`NgfmFileConnector ready at ${this.config.root}`);
    }

    rm(path: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const stats = fs.statSync(path);
                const isFolder = stats.isDirectory();
                if (isFolder) {
                    rimraf.sync(`path${isFolder ? '/*.*' : ''}`);
                }
                fs.removeSync(path);
                resolve();
            } catch (err) {
                return reject(this.getError(err));
            }
        });
    }

    rename(from: string, to: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.rename(from, to, err => {
                if (err) {
                    return reject(this.getError(err));
                }
                resolve();
            });
        });
    }
    mkDir(path: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.mkdir(path, err => {
                if (err) {
                    return reject(this.getError(err));
                }
                resolve();
            });
        });
    }
    private ensureDirIfNeeded(path) {
        if (this.config.autoCreateFolders) {
            fs.ensureDirSync(path)
        }
    }
    get(req: Request, res: Response, next: any) {
        const fullPath = this.store.getFullPath(req.path);
        fs.stat(fullPath, (err, stats) => {
            if (err) { return next(err); }
            if (stats.isDirectory()) {
                this.ls(fullPath, this.store.getPublicUrl(req)).then(
                    data => res.json(data),
                    error => next(error)
                );
                return;
            }
            if (this.config && this.config.serveStatic) {
                if ('s' in req.query) {
                    return this.image.middleware(req, res, next);
                }
                express.static(this.config.root)(req, res, next);
            }
        });
    }
    ls(path: string, publicUrl: string): Promise<NgfmItem[]> {
        this.ensureDirIfNeeded(path);
        return new Promise((resolve, reject) => {
            fs.readdir(path, (err, files) => {
                if (err) {
                    return reject(this.getError(err));
                }
                resolve(files.map(fileName => {
                    const filePath = pathLib.join(path, fileName);
                    const stat = fs.statSync(filePath);
                    const item = {
                        name: fileName,
                        lastModified: new Date(stat.mtime).getTime(),
                        created: new Date(stat.birthtime).getTime(),
                        url: publicUrl + fileName
                    };
                    const mime = mimeTypes.lookup(fileName);
                    const isResizeable = stat.isFile() && /image/i.test(String(mime));
                    return stat.isFile() ? new NgfmFile(Object.assign(item, {
                        thumbnail: this.config.serveStatic && isResizeable ? `${item.url}?s=t` : null,
                        preview: this.config.serveStatic && isResizeable ? `${item.url}?s=p` : null,
                        size: stat.size,
                        type: mime,
                        extension: fileName.replace(/.*\./, '').toLowerCase(),
                    })) : new NgfmFolder(item);
                }));
            });
        });
    }
    uploadFile(path: string, file): Promise<any> {
        const dirname = pathLib.dirname(path);
        this.ensureDirIfNeeded(dirname);
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(dirname)) {
                return reject(`Directory does not exist: ${dirname}`);
            }
            fs.copyFile(file.path, path, err => {
                if (err) {
                    return reject(this.getError(err));
                }
                resolve({
                    name: file.name,
                    size: file.size,
                    type: file.type
                });
            });
        });
    }
    getError(fsError: any) {
        return `${fsError.errno} ${fsError.code}`;
    }
}