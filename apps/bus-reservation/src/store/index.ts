import { createAuthStore } from '@pbotapps/authorization';
import { defineStore } from 'pinia';
import { v4 as uuid } from 'uuid';
import { computed, reactive } from 'vue';

export type Zone = {
  id: string; //UUID
  geometry: object;
  label: string;
};

export type User = {
  id: string; //UUID
  email: string;
  enabled: boolean;
  label: string;
  created: Date;
  creator: string;
  updated: Date;
  updater: string;
};

export type Reservation = {
  id: string; //UUID
  user: User;
  zone: Zone;
  start: Date;
  end: Date;
};

export const useAuthStore = createAuthStore(
  import.meta.env.VITE_AZURE_CLIENT_ID,
  import.meta.env.VITE_AZURE_TENANT_ID
);

export const useStore = defineStore('bus-reservation', () => {
  const users = reactive<Array<User>>([]);

  const zones = reactive<Array<Zone>>(
    [...new Array(7).keys()].map(x => {
      return {
        id: uuid(),
        geometry: {
          type: 'Polygon',
          coordinates: [[]],
        },
        label: `Zone ${x}`,
      };
    })
  );

  const reservations = reactive<Array<Reservation>>([]);

  const addReservation = (res: Reservation) => {
    reservations.push(res);
  };

  const getCurrentUser = async () => {
    const store = useAuthStore();

    const user = await store.getUser();
    if (!user) throw new Error('You must be logged in to modify data.');

    return user;
  };

  const editUser = async (u: User) => {
    const currentUser = await getCurrentUser();

    const idx = users.findIndex(x => x.id == u.id);
    if (idx == -1) throw Error(`Cannot find user with id '${u.id}`);

    users[idx] = {
      ...users[idx],
      ...u,
      updated: new Date(),
      updater: currentUser.email,
    };
  };

  const addUser = async (u: User) => {
    const currentUser = await getCurrentUser();

    const user = {
      ...u,
      id: uuid(),
      created: new Date(),
      creator: currentUser.email,
      updated: new Date(),
      updater: currentUser.email,
    };

    users.push(user);
  };

  const user = computed(() => (id: string) => users.find(x => x.id == id));

  return {
    // state
    reservations,
    users,
    zones,
    // getters
    user,
    // actions
    addReservation,
    addUser,
    editUser,
  };
});
