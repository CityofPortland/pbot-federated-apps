import {
  DBSchema,
  IDBPDatabase,
  IDBPTransaction,
  openDB,
  OpenDBCallbacks,
} from 'idb';

import { Sign } from '../types';

interface SignDB extends DBSchema {
  sign: {
    key: string;
    value: Sign;
  };
}

const upgradePaths: Record<
  number,
  (
    oldVersion: number,
    db: IDBPDatabase<SignDB>,
    transaction: IDBPTransaction<SignDB, 'sign'[], 'versionchange'>
  ) => void
> = {
  1: (_, db) => {
    db.createObjectStore('sign', {
      keyPath: '_id',
    });
  },
  2: async (oldVersion, db, transaction) => {
    console.debug('Upgrading to version 2...');

    let signs = new Array<Sign>();

    if (oldVersion == 1) {
      console.debug('migrating signs...');
      signs = await transaction.objectStore('sign').getAll();

      console.debug('Deleting old store');
      db.deleteObjectStore('sign');
    }

    console.debug('Creating new store');
    db.createObjectStore('sign', {
      keyPath: 'id',
    });

    signs.forEach(sign => {
      const { _id, _created, _createdBy, _changed, _changedBy, ...rest } =
        sign as unknown as {
          _id: string;
          _created: Date;
          _changed: Date;
          _createdBy: string;
          _changedBy: string;
        } & Omit<Sign, 'id' | 'created' | 'creator' | 'updated' | 'updater'>;

      transaction.objectStore('sign').put(
        JSON.parse(
          JSON.stringify({
            id: _id,
            created: _created,
            creator: _createdBy,
            updated: _changed,
            updater: _changedBy,
            ...rest,
          })
        )
      );
    });
  },
};

export class SignDatabase {
  db: Promise<IDBPDatabase<SignDB>>;

  constructor() {
    const dbCallbacks: OpenDBCallbacks<SignDB> = {
      upgrade: async (db, oldver, newver, transaction) => {
        console.debug('Upgrading database', oldver, newver);

        const path =
          newver != null ? upgradePaths[newver] : upgradePaths[oldver];

        path(oldver, db, transaction);
      },
    };

    this.db = openDB<SignDB>('sign-library', 2, dbCallbacks);
  }

  all = async () => (await this.db).getAll('sign');

  exists = async (code: string) =>
    (await this.db).get('sign', code) == undefined;

  get = async (code: string) => (await this.db).get('sign', code);

  put = async (code: string, sign: Sign) =>
    (await this.db).put('sign', JSON.parse(JSON.stringify(sign)));
}

export const signDatabase = new SignDatabase();
