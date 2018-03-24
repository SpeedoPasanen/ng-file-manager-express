import { NgfmItem } from "../models/ngfm-item";
import { NgfmBaseConnector } from "./ngfm-base-connector";

export abstract class NgfmConnector extends NgfmBaseConnector {
    abstract uploadFile(path: string, _file): Promise<any>;
    abstract ls(path: string, publicUrl: string): Promise<NgfmItem[]>;
    abstract mkDir(path: string): Promise<void>;
    abstract fileExists(path: string): Promise<boolean>;
    abstract folderExists(path: string): Promise<boolean>;
    abstract rm(path: string): Promise<void>;
    abstract rename(from: string, to: string): Promise<void>;
}