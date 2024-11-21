import { RuleType } from '@pbotapps/authorization';
import { formData, query, GraphQLOptions } from '@pbotapps/components';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { signDatabase } from '../service/db';
import { Sign, SignInput } from '../types';
import { useAuthStore } from './auth';
import { useMessageStore } from './messages';

const fragment = `
fragment fields on SignInterface {
  updated
  updater
  created
  creator
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

export const useSignStore = defineStore('signs', () => {
  const rules = ref<Array<RuleType>>([]);
  const signs = ref<Array<Sign>>([]);

  const { getToken } = useAuthStore();
  const messages = useMessageStore();

  const sign = computed(
    () => (code: string) => signs.value.find(s => s.code == code)
  );

  const init = async () => {
    const dbSigns = await signDatabase.all();

    if (dbSigns?.length == 0) {
      // No cached signs, refresh from service
      console.debug('No signs in database. Refreshing from service...');
      refresh();
    } else {
      signs.value = dbSigns ?? [];
    }
  };

  const refresh = async () => {
    messages.add(
      'signs:refresh',
      'info',
      new Error('Retrieving signs from service...')
    );
    const token = await getToken();

    const options: GraphQLOptions = {
      operation: `
        query getSignsList {
          signs {
            id
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
        messages.remove('signs:refresh');

        return res.data;
      })
      .then(data => {
        return data?.signs?.filter(s => (s ? true : false));
      })
      .catch(reason => {
        messages.add(
          'signs:refresh',
          'error',
          Error('Error retrieving signs', { cause: reason })
        );
      });

    if (res && res.length) {
      signs.value = res;
      signs.value.forEach(sign => signDatabase.put(sign.code, sign));
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
    messages.remove('signs:add');

    const token = await getToken();

    if (!token) {
      messages.add(
        'signs:add',
        'error',
        new Error('Error adding sign!', {
          cause: new Error('You are not logged in! Please sign in again.'),
        })
      );
      return;
    }

    const { input, filelist, map } = createInput(payload);

    let res: Sign | undefined;

    try {
      res = await formData<{ addSign: Sign }>(
        {
          operation: `
          mutation addSign($input: SignAddInput!) {
            addSign(payload: $input) {
              id
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
            messages.add(
              'sings:add',
              'error',
              new Error('Error adding sign', {
                cause: res.errors.map(e => e.message),
              })
            );
          }

          return res.data;
        })
        .then(data => data?.addSign);
    } catch (error: unknown) {
      messages.add(
        'signs:add',
        'error',
        new Error('Error adding sign!', { cause: error })
      );
    }

    if (res) {
      signs.value.push({ ...res });
      signDatabase.put(res.code, { ...res });
    }

    return res;
  };

  const edit = async (code: string, payload: Partial<SignInput>) => {
    messages.remove('signs:edit');

    const token = await getToken();

    if (!token) throw new Error('You are not logged in! Please sign in again.');

    const { input, filelist, map } = createInput(payload);

    let res: Sign | undefined;

    try {
      res = await formData<{ editSign: Sign }>(
        {
          operation: `
          mutation editSign($id: ID!, $input: SignEditInput!) {
            editSign(id: $id, payload: $input) {
              id
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
            messages.add(
              'signs:edit',
              'error',
              new Error('Error editing sign', {
                cause: res.errors.map(e => e.message),
              })
            );
          }
          return res.data;
        })
        .then(data => data?.editSign);
    } catch (error: unknown) {
      messages.add(
        'signs:edit',
        'error',
        new Error('Error editing sign!', { cause: error })
      );
    }

    if (res) {
      const idx = signs.value.findIndex(s => s.code == res.code);
      signs.value.splice(idx, 1, { ...res });
      signDatabase.put(code, { ...res });
    }

    return res;
  };

  const get = async (code: string, useDb = true) => {
    let sign: Sign | undefined = undefined;

    if (useDb) {
      sign = await signDatabase.get(code);
    }

    if (sign == undefined) {
      const token = await getToken();

      const res = await query<{ getSign: Sign }>({
        operation: `
        query getSign($code: String!) {
          getSign(code: $code) {
            id
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
        headers: {
          Authorization: token != undefined ? `Bearer ${token}` : null,
        },
      }).catch(err => {
        messages.add(
          'signs:get',
          'error',
          Error(`Error retrieving sign ${code}!`, { cause: err })
        );
      });

      if (res && res.data) sign = res.data.getSign;
    }

    return sign;
  };

  return {
    // state
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
