import { NgfmItem } from './ngfm-item';
export class NgfmFolder extends NgfmItem {
    readonly itemType = 'folder';
    constructor(init: any) {
        super(init);
    }

}
