export class NgfmConnectorConfig {
    root: string;
    createRoot?: boolean = false;
    autoCreateFolders?: boolean = true;
    constructor(init: any) {
        Object.assign(this, init);
    }
}