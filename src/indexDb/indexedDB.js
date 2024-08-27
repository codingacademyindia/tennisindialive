// src/utils/indexedDB.js
import { openDB } from 'idb';

const DB_NAME = 'myDatabase';
const DB_VERSION = 1;
const STORE_NAME = 'myStore';

export const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        },
    });
};

export const setItem = async (key, value) => {
    const db = await initDB();
    return db.put(STORE_NAME, value, key);
};

export const getItem = async (key) => {
    const db = await initDB();
    return db.get(STORE_NAME, key);
};
