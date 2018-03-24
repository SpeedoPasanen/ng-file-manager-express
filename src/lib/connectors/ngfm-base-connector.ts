import { NgfmConnectorConfig } from "./ngf-connector.config";
import { NgfmConnectorStore } from './ngfm-connector.store';
export class NgfmBaseConnector {
    store: NgfmConnectorStore;
    constructor(config: NgfmConnectorConfig) {
        if (!(config && config.root)) {
            throw Error('NgfmConnector usage: new NgfmXXConnector({root: path_to_files})');
        }
        this.store = new NgfmConnectorStore(config);
    }
}