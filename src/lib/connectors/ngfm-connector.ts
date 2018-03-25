import { NgfmItem } from "../models/ngfm-item";
import { NgfmBaseConnector } from "./ngfm-base-connector";
import { Request, Response } from "express";

export abstract class NgfmConnector extends NgfmBaseConnector {
    abstract uploadFile(path: string, _file): Promise<any>;
    abstract get(req: Request, res: Response, next);
    abstract ls(path: string, publicUrl: string): Promise<NgfmItem[]>;
    abstract mkDir(path: string): Promise<void>;
    abstract rm(path: string): Promise<void>;
    abstract rename(from: string, to: string): Promise<void>;
}