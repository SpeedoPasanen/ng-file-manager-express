export class NgfmItem {
    /**
     * Full name eg. `my_pic.jpg`
     */
    name = '';
    /**
     * UNIX timestamp
     */
    lastModified: number;
    created: number;
    readonly itemType: string;
    get isFile() { return this.itemType === 'file'; }
    get isFolder() { return this.itemType === 'folder'; }
    constructor(init: any) {
        Object.assign(this, init);
    }
}