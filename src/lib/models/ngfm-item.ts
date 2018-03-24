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
}