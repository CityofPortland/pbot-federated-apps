import { RuleType } from '@pbotapps/authorization';
import { formData, query, GraphQLOptions } from '@pbotapps/components';
import { DBSchema, openDB, OpenDBCallbacks } from 'idb';
import { defineStore } from 'pinia';
import { Sign, SignInput } from '../types';
import { computed, ref } from 'vue';
import { useAuthStore } from './auth';
import { useErrorStore } from './errors';

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

interface SignDB extends DBSchema {
  sign: {
    key: string;
    value: Sign;
  };
}

const dbCallbacks: OpenDBCallbacks<SignDB> = {
  upgrade: db => {
    db.createObjectStore('sign', {
      keyPath: '_id',
    });
  },
};

function getDb() {
  return openDB<SignDB>('sign-library', 1, dbCallbacks);
}

export const useSignStore = defineStore('signs', () => {
  const rules = ref<Array<RuleType>>([]);
  const signs = ref<Array<Partial<Sign>>>([]);

  const { getToken } = useAuthStore();
  const errors = useErrorStore();

  const sign = computed(
    () => (code: string) => signs.value.find(s => s.code == code)
  );

  const init = async () => {
    const db = await getDb();

    const dbSigns = await db.getAll('sign');

    if (dbSigns.length == 0) {
      // No cached signs, refresh from service
      refresh();
    } else {
      signs.value = dbSigns;
    }
  };

  const refresh = async () => {
    const token = await getToken();

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
          errors.add(
            'signs:refresh',
            Error('Error retrieving signs', { cause: res.errors })
          );
        }
        return res.data;
      })
      .then(data => data?.signs?.filter(s => (s ? true : false)))
      .catch(reason => {
        errors.add(
          'signs:refresh',
          Error('Error retrieving signs', { cause: reason })
        );
      });

    if (res && res.length) {
      getDb().then(db =>
        db.clear('sign').then(() =>
          res.forEach(s => {
            db.put('sign', JSON.parse(JSON.stringify(s)));
          })
        )
      );

      signs.value = res;
    }
  };

  const createInput = (payload: Partial<SignInput>) => {
    const { code, image, design, ...rest } = payload;

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

    return { input, filelist, map };
  };

  const add = async (payload: Partial<SignInput>) => {
    const token = await getToken();

    if (!token) throw new Error('You are not logged in! Please sign in again.');

    const { input, filelist, map } = createInput(payload);

    let res: Sign | undefined;

    try {
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
            errors.add(
              'sings:add',
              new Error('Error adding sign', {
                cause: res.errors.map(e => e.message),
              })
            );
          }
          return res.data;
        })
        .then(data => data?.addSign);
    } catch (error: unknown) {
      errors.add(
        'signs:add',
        new Error('Error adding sign!', { cause: error })
      );
    }

    res && signs.value.push({ ...res });
  };

  const edit = async (payload: Partial<SignInput>) => {
    const token = await getToken();

    if (!token) throw new Error('You are not logged in! Please sign in again.');

    const { input, filelist, map } = createInput(payload);

    let res: Sign | undefined;

    try {
      res = await formData<{ addSign: Sign }>(
        {
          operation: `
          mutation editSign($input: SignInput!) {
            editSign(input: $input) {
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
            errors.add(
              'sings:edit',
              new Error('Error editing sign', {
                cause: res.errors.map(e => e.message),
              })
            );
          }
          return res.data;
        })
        .then(data => data?.addSign);
    } catch (error: unknown) {
      errors.add(
        'signs:edit',
        new Error('Error editing sign!', { cause: error })
      );
    }

    res && signs.value.push({ ...res });
  };

  const get = async (code: string) => {
    const res = await query<{ getSign: Sign[] }>({
      operation: `
      query getSign($input: SignInput!) {
        getSign(code: $code) {
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
        code,
      },
    }).catch(err => {
      errors.add(
        'sings:get',
        Error(`Error retrieving sign ${code}!`, { cause: err })
      );
    });

    if (res && res.data) return res.data.getSign;
  };

  return {
    // state
    errors,
    rules,
    signs,
    // getters
    sign,
    // actions
    add,
    edit,
    get,
    init,
    refresh,
  };
});
