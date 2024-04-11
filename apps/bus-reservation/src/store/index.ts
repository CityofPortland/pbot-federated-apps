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
  created: Date;
  creator: string;
  updated: Date;
  updater: string;
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

  const getCurrentUser = async () => {
    const store = useAuthStore();

    const user = await store.getUser();
    if (!user) throw new Error('You must be logged in to modify data.');

    return user;
  };

  const addReservation = async (
    res: Pick<Reservation, 'end' | 'start' | 'user' | 'zone'>
  ) => {
    const existing = reservations
      .reduce((acc, curr) => {
        if (curr.zone.id == res.zone.id) {
          acc.push(curr);
        }
        return acc;
      }, new Array<Reservation>())
      .reduce((acc, curr) => {
        if (
          (res.start >= curr.start && res.start <= curr.end) ||
          (res.end >= curr.start && res.end <= curr.end) ||
          (res.start <= curr.start && res.end >= curr.end)
        ) {
          acc.push(curr);
        }
        return acc;
      }, new Array<Reservation>());
    if (existing.length > 0) {
      throw Error(
        `There is an existing reservation in ${res.zone.label} on the same dates`
      );
    }
    const store = useAuthStore();

    const currentUser = await store.getUser();
    if (!currentUser) throw new Error('Not logged in.');

    const r = {
      ...res,
      id: uuid(),
      created: new Date(),
      creator: currentUser.email,
      updated: new Date(),
      updater: currentUser.email,
    };

    reservations.push(r);
  };

  const editReservation = async (
    r: Pick<Reservation, 'end' | 'start' | 'zone' | 'user' | 'id'>
  ) => {
    const store = useAuthStore();
    const currentUser = await store.getUser();
    if (!currentUser) throw new Error('Not logged in.');

    const existing = reservations
      .reduce((acc, curr) => {
        if (curr.id != r.id) {
          acc.push(curr);
        }
        return acc;
      }, new Array<Reservation>())
      .reduce((acc, curr) => {
        if (curr.zone.id == r.zone.id) {
          acc.push(curr);
        }
        return acc;
      }, new Array<Reservation>())
      .reduce((acc, curr) => {
        if (
          (r.start >= curr.start && r.start <= curr.end) ||
          (r.end >= curr.start && r.end <= curr.end) ||
          (r.start <= curr.start && r.end >= curr.end)
        ) {
          acc.push(curr);
        }
        return acc;
      }, new Array<Reservation>());
    if (existing.length > 0) {
      throw Error(
        `There is an existing reservation in ${r.zone.label} on the same dates`
      );
    }

    const idx = reservations.findIndex(x => x.id == r.id);
    if (idx == -1) throw Error(`Cannot find reservation with id '${r.id}`);

    reservations[idx] = {
      ...reservations[idx],
      ...r,
      updated: new Date(),
      updater: currentUser.email,
    };
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
  const reservation = computed(
    () => (id: string) => reservations.find(x => x.id == id)
  );

  const zone = computed(() => (id: string) => zones.find(x => x.id == id));

  return {
    // state
    reservations,
    users,
    zones,
    // getters
    user,
    reservation,
    zone,
    // actions
    addUser,
    editUser,
    addReservation,
    editReservation,
  };
});
