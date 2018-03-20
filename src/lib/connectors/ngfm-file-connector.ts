
import fs from 'fs';
import _path from 'path';
import { NgfmConnector } from './ngfm-connector';
import { NgfmFile } from '../models/ngfm-file';
import { NgfmFolder } from '../models/ngfm-folder';
import { NgfmItem } from '../models/ngfm-item';
import * as mimeTypes from 'mime-types';
export class NgfmFileConnector implements NgfmConnector {
    constructor(private config: { root: string }) {
        if (!(config && config.root)) {
            throw Error('NgfmMiddleware usage: new NgfmMiddleware({root:path_to_files})');
        }
        if (!fs.existsSync(config.root)) {
            throw Error(`config.root must be a path to an existing directory. If the path is correct, please create it first.`);
        }
        console.log(config.root);
    }
    folderExists(path: string): Promise<boolean> {
        return this.someExists(path, false);
    }
    fileExists(path: string): Promise<boolean> {
        return this.someExists(path, true);
    }
    someExists(path: string, lookingForAFile: boolean): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const fullPath = this.getFullPath(path);
            fs.exists(fullPath, exists => {
                const stat = fs.statSync(fullPath);
                return resolve(exists && (lookingForAFile ? stat.isFile() : stat.isDirectory()));
            });
        });
    }
    mkDir(path: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.mkdir(this.getFullPath(path), err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }
    ls(path: string): Promise<NgfmItem[]> {
        return new Promise((resolve, reject) => {
            fs.readdir(this.getFullPath(path), (err, files) => {
                if (err) {
                    return reject(err);
                }
                resolve(files.map(fileName => {
                    const fullPath = this.getFullPath(path, fileName);
                    const stat = fs.statSync(fullPath);
                    const item = {
                        name: fileName,
                        lastModified: new Date(stat.mtime).getTime(),
                        created: new Date(stat.birthtime).getTime(),
                        stat: stat,
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
    private getFullPath(...args) {
        return _path.join(this.config.root, ...args);
    }
    uploadFile(path: string, _file): Promise<any> {
        return new Promise((resolve, reject) => {
            const dirname = this.getFullPath(_path.dirname(path));
            const fullPath = this.getFullPath(path);
            if (!fs.existsSync(dirname)) {
                return reject(`Directory does not exist: ${dirname}`);
            }
            fs.copyFile(_file.path, fullPath, err => {
                if (err) {
                    return reject(err);
                }
                resolve(_file);
            });
        });
    }
}