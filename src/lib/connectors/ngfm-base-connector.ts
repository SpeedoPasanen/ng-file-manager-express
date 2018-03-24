import { NgfmConnectorStore } from './ngfm-connector.store';
import { NgfmConnectorConfig } from './ngfm-connector.config';
export class NgfmBaseConnector {
    store: NgfmConnectorStore;
    config: NgfmConnectorConfig;
    constructor(config: NgfmConnectorConfig) {
        this.config = new NgfmConnectorConfig(config);
        if (!(config && config.root)) {
            throw Error('NgfmConnector usage: new NgfmXXConnector({root: path_to_files})');
        }
        this.store = new NgfmConnectorStore(config);
    }
}