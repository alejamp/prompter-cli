// Remember to set type: module in package.json or use .mjs extension
import path, { dirname } from 'node:path'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { fileURLToPath } from 'node:url';

export interface IStore {
    token: string;
}

export class Store {

    db: Low<unknown>;

    constructor() {
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const file = path.join(__dirname, 'db.json');
        const adapter = new JSONFile(file)
        const defaultData = { token: '' }
        this.db = new Low(adapter, defaultData)
    }


    async setToken(newToken: string) {
        // Load the database
        await this.db.read();

        // Set the token in the database
        (this.db.data as IStore).token = newToken;

        // Finally write db.data content to file
        await this.db.write();
    }

    async getToken() {
        // Load the database
        await this.db.read();

        return (this.db.data as IStore).token;
    }
}