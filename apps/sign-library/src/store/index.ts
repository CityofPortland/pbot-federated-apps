import { formData, query, useLogin } from '@pbotapps/components';
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
  legend
  status
  image {
    design
    full
    thumbnail
  }
  height
  type
  shape
  width
}`;

export const useStore = defineStore('sign-library', {
  state: () => ({
    data: {
      signs: new Array<Partial<Sign>>(),
    },
    errors: new Array<unknown>(),
  }),
  getters: {
    sign:
      state =>
      (code: string): Partial<Sign> | undefined => {
        const sign = state.data.signs.find(s => s.code == code);

        return sign ? { ...sign } : undefined;
      },
  },
  actions: {
    async getSigns() {
      const { clientId, getToken } = useLogin();
      const token = await getToken([`${clientId}/.default`]);
      const res = await query<{ signs: Array<Sign> }>({
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(res => {
          if (res.errors) {
            this.errors = res.errors;
          }
          return res.data;
        })
        .then(data => data?.signs);

      this.data.signs = res || [];
    },
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
      let res: Partial<Sign> | undefined;

      if (!existing) {
        // Add sign
        res = await formData<{ addSign: Partial<Sign> }>(
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
      } else {
        // Edit sign
        res = await formData<{ editSign: Partial<Sign> }>(
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
              input: payload,
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
      }

      this.data.signs.splice(
        this.data.signs.findIndex(s => s.code == code),
        1,
        { ...res }
      );

      return res;
    },
  },
});
