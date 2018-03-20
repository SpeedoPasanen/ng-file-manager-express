import { NgfmItem } from "../models/ngfm-item";

export abstract class NgfmConnector {
    abstract uploadFile(path: string, _file): Promise<any>;
    abstract ls(path: string): Promise<NgfmItem[]>;
    abstract mkDir(path: string): Promise<void>;
    abstract fileExists(path: string): Promise<boolean>;
    abstract folderExists(path: string): Promise<boolean>;
}