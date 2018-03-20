import { NgfmItem } from './ngfm-item';
export class NgfmFile extends NgfmItem {
    constructor(init: any) {
        super(init);
    }
    readonly itemType = 'file';
    /**
     * Lower case extension without comma, eg. `jpg`
     */
    extension = '';

    /**
     * MIME type eg. `image/jpeg`
     */
    type = '';

    /**
     * Size in bytes
     */
    size = 0;

    /**
     * URL where the file is served
     */
    url = '';
    download = '';
    thumbnail = '';
    preview = '';

}
