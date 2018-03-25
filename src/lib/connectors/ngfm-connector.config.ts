export class NgfmConnectorConfig {
    root: string;
    createRoot?: boolean = false;
    autoCreateFolders?: boolean = true;
    absoluteUrls?: boolean = true;
    serveStatic?: boolean = true;
    constructor(init: any) {
        Object.assign(this, init);
    }
}