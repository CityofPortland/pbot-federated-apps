import { RuleType } from '@pbotapps/authorization';
import {
  formData,
  query,
  useLogin,
  GraphQLOptions,
} from '@pbotapps/components';
import { openDB, OpenDBCallbacks } from 'idb';
import { defineStore } from 'pinia';
import { Sign, SignInput } from '../types';

const fragment = `
fragment fields on SignInterface {
  _changed
  _changedBy
  _created
  _createdBy
  code
  color
  comment
  height
  image {
    design
    full
    thumbnail
  }
  legend
  mutcdCode
  odotCode
  obsoletePolicy
  replacedBy
  shape
  source
  status
  type
  width
}`;

const dbCallbacks: OpenDBCallbacks<unknown> = {
  upgrade: db => {
    const objectStore = db.createObjectStore('sign', {
      keyPath: '_id',
    });

    objectStore.createIndex('_changed', '_changed', { unique: false });
    objectStore.createIndex('_changedBy', '_changedBy', {
      unique: false,
    });
    objectStore.createIndex('_created', '_created', { unique: false });
    objectStore.createIndex('_createdBy', '_createdBy', {
      unique: false,
    });
    objectStore.createIndex('_revisions', '_revisions', {
      unique: false,
    });
    objectStore.createIndex('code', 'code', { unique: true });
    objectStore.createIndex('color', 'color', { unique: false });
    objectStore.createIndex('comment', 'comment', { unique: false });
    objectStore.createIndex('height', 'height', { unique: false });
    objectStore.createIndex('image ', 'image', { unique: false });
    objectStore.createIndex('legend', 'legend', { unique: false });
    objectStore.createIndex('mutcdCode', 'mutcdCode', { unique: false });
    objectStore.createIndex('shape', 'shape', { unique: false });
    objectStore.createIndex('status', 'status', { unique: false });
    objectStore.createIndex('type', 'type', { unique: false });
    objectStore.createIndex('width', 'width', { unique: false });
  },
};

export const useStore = defineStore('sign-library', {
  state: () => ({
    data: {
      signs: new Array<Sign>(),
    },
    errors: new Array<unknown>(),
    rules: new Array<RuleType>(),
  }),
  getters: {
    hasRule: state => (action: string, subject: string) => {
      const rule = state.rules.find(
        r => r.action === action && r.subject === subject
      );
      return rule != undefined;
    },
    sign:
      state =>
      (code: string): Partial<Sign> | undefined => {
        const sign = state.data.signs.find(s => s.code == code);

        return sign ? { ...sign } : undefined;
      },
  },
  actions: {
    async addRevision(payload: Partial<SignInput>) {
      const { clientId, getToken } = useLogin();
      const token = await getToken([`${clientId}/.default`]);
      const { code, image, design, ...rest } = payload;

      if (!code) {
        this.errors.push(new Error('Must have code to add revision'));
        return;
      }

      const input: Partial<SignInput> = { ...rest, code };

      const filelist = new Array<File>();
      const map = new Map<string, string>();

      if (image) {
        for (let i = 0; i < image.length; i++) {
          const file = image.item(i);
          if (file) {
            input.image = undefined;
            map.set(`variables.input.image`, filelist.length.toLocaleString());
            filelist.push(file);
          }
        }
      }

      if (design) {
        for (let i = 0; i < design.length; i++) {
          const file = design.item(i);
          if (file) {
            input.design = undefined;
            map.set(`variables.input.design`, filelist.length.toLocaleString());
            filelist.push(file);
          }
        }
      }

      const existing = this.sign(code);
      let res: Sign | undefined;

      if (!existing) {
        // Add sign
        res = await formData<{ addSign: Sign }>(
          {
            operation: `
          mutation addSign($input: SignInput!) {
            addSign(input: $input) {
              _id
              ...fields
              _revisions {
                ...fields
              }
            }
          }
          ${fragment}
          `,
            variables: {
              input,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
          filelist,
          map
        )
          .then(res => {
            if (res.errors) {
              this.errors = res.errors;
            }
            return res.data;
          })
          .then(data => data?.addSign);

        res && this.data.signs.push({ ...res });
      } else {
        const { code, ...input } = payload;
        // Edit sign
        res = await formData<{ editSign: Sign }>(
          {
            operation: `
          mutation editSign($id: ID!, $input: SignInput!) {
            editSign(_id: $id, input: $input) {
              _id
              ...fields
              _revisions {
                ...fields
              }
            }
          }
          ${fragment}
          `,
            variables: {
              id: code,
              input,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
          filelist,
          map
        )
          .then(res => {
            if (res.errors) {
              this.errors = res.errors;
            }
            return res.data;
          })
          .then(data => data?.editSign);

        res &&
          this.data.signs.splice(
            this.data.signs.findIndex(s => s.code == code),
            1,
            {
              ...res,
            }
          );
      }

      return res;
    },
    async getSign(code: string) {
      const { clientId, getToken } = useLogin();
      const token = await getToken([`${clientId}/.default`]);

      const options: GraphQLOptions = {
        operation: `
        query getSign {
          signs(input: { _id: "${code}" }) {
            _id
            ...fields
            _revisions {
              ...fields
            }
          }
        }
        ${fragment}
        `,
      };

      if (token)
        options.headers = {
          Authorization: `Bearer ${token}`,
        };

      const res = await query<{ signs: Array<Sign> }>(options)
        .then(res => {
          if (res.errors) {
            this.errors = res.errors;
          }
          return res.data;
        })
        .then(data => data?.signs?.filter(s => (s ? true : false)));

      if (res && res.length) {
        const signs = res || [];

        const db = await openDB('sign-library', 1, dbCallbacks);

        signs.forEach(s => {
          db.put('sign', JSON.parse(JSON.stringify(s)));
        });

        return signs.pop();
      }

      return undefined;
    },
    async getSigns() {
      const db = await openDB('sign-library', 1, dbCallbacks);

      const signs = await db.getAll('sign');

      if (signs && signs.length) {
        this.data.signs = signs;
      } else {
        try {
          await this.refreshSigns();
        } catch {
          this.errors.push({ message: 'Failed to refresh sign database' });
        }
      }
    },
    async refreshSigns() {
      const { clientId, getToken } = useLogin();
      const token = await getToken([`${clientId}/.default`]);

      const options: GraphQLOptions = {
        operation: `
        query getSignsList {
          signs {
            _id
            ...fields
            _revisions {
              ...fields
            }
          }
        }
        ${fragment}
        `,
      };

      if (token)
        options.headers = {
          Authorization: `Bearer ${token}`,
        };

      const res = await query<{ signs: Array<Sign> }>(options)
        .then(res => {
          if (res.errors) {
            this.errors = res.errors;
          }
          return res.data;
        })
        .then(data => data?.signs?.filter(s => (s ? true : false)));

      if (res && res.length) {
        this.data.signs = res || [];

        const db = await openDB('sign-library', 1, dbCallbacks);

        await db.clear('sign');

        this.data.signs.forEach(s => {
          db.put('sign', JSON.parse(JSON.stringify(s)));
        });
      }
    },
    async refreshRules() {
      const { clientId, getToken } = useLogin();
      const token = await getToken([`${clientId}/.default`]);

      const options: GraphQLOptions = {
        operation: `
        query refreshRules {
          rules {
            _id
            action
            subject
          }
        }
        `,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await query<{ rules: Array<RuleType>; signs: Array<Sign> }>(
        options
      )
        .then(res => {
          if (res.errors) {
            this.errors = res.errors;
          }
          return res.data;
        })
        .then(data => data?.rules)
        .catch(() => {
          this.errors.push('Unathorized');
          return new Array<RuleType>();
        });

      this.rules = res || [];
    },
  },
});
