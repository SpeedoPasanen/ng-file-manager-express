
import * as fs from 'fs';
import * as pathLib from 'path';
import * as mimeTypes from 'mime-types';
import * as mkdirp from 'mkdirp';
const rimraf = require('rimraf');
import { NgfmBaseConnector } from './ngfm-base-connector';
import { NgfmConnector } from './ngfm-connector';
import { NgfmFile } from '../models/ngfm-file';
import { NgfmFolder } from '../models/ngfm-folder';
import { NgfmItem } from '../models/ngfm-item';
import { NgfmConnectorConfig } from './ngfm-connector.config';
export class NgfmFileConnector extends NgfmBaseConnector implements NgfmConnector {
    constructor(private config: NgfmConnectorConfig) {
        super(config);
        if (!fs.existsSync(config.root)) {
            if (config.createRoot) {
                mkdirp(config.root, err => {
                    if (err) { throw err; }
                    console.log(`Created: ${config.root}`);
                });
            } else {
                throw Error(`${config.root} does not exist. Set config.createRoot to true or create the root directory first.`);
            }
        }
        console.log(`NgfmFileConnector ready at ${this.config.root}`);
    }
    folderExists(path: string): Promise<boolean> {
        return this.someExists(path, false);
    }
    fileExists(path: string): Promise<boolean> {
        return this.someExists(path, true);
    }
    someExists(path: string, lookingForAFile: boolean): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const fullPath = this.store.getFullPath(path);
            fs.exists(fullPath, exists => {
                const stat = fs.statSync(fullPath);
                return resolve(exists && (lookingForAFile ? stat.isFile() : stat.isDirectory()));
            });
        });
    }
    rm(path: string): Promise<void> {
        return new Promise((resolve, reject) => {
            rimraf(path, err => {
                if (err) {
                    return reject(this.getError(err));
                }
                resolve();
            });
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
    ls(path: string): Promise<NgfmItem[]> {
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
                        url: pathLib.join(path, fileName)
                    };
                    return stat.isFile() ? new NgfmFile(Object.assign(item, {
                        size: stat.size,
                        type: mimeTypes.lookup(fileName),
                        extension: fileName.replace(/.*\./, '').toLowerCase(),
                    })) : new NgfmFolder(item);
                }));
            });
        });
    }
    uploadFile(path: string, _file): Promise<any> {
        return new Promise((resolve, reject) => {
            const dirname = pathLib.dirname(path);
            if (!fs.existsSync(dirname)) {
                return reject(`Directory does not exist: ${dirname}`);
            }
            fs.copyFile(_file.path, path, err => {
                if (err) {
                    return reject(this.getError(err));
                }
                resolve(_file);
            });
        });
    }
    getError(fsError: any) {
        return `${fsError.errno} ${fsError.code}`;
    }
}