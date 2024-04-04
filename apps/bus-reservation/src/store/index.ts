import { createAuthStore } from '@pbotapps/authorization';
import { defineStore } from 'pinia';
import { v4 as uuid } from 'uuid';
import { computed, ref } from 'vue';

export interface Zone {
  id: string; //UUID
  geometry: object;
  label: string;
}

export interface User {
  id: string; //UUID
  email: string;
  enabled: boolean;
  label: string;
  created: Date;
  creator: string;
  updated: Date;
  updater: string;
}

export interface Reservation {
  id: string; //UUID
  user: User;
  zone: Zone;
  start: Date;
  end: Date;
}

export const useAuthStore = createAuthStore(
  import.meta.env.VITE_AZURE_CLIENT_ID,
  import.meta.env.VITE_AZURE_TENANT_ID
);

export const useStore = defineStore('bus-reservation', () => {
  const users = ref<Array<User>>([
    {
      id: uuid(),
      email: 'anonymous@portlandoregon.gov',
      enabled: true,
      label: 'Hotel Enabled',
      created: new Date(),
      creator: 'sam.berhane@portlandoregon.gov',
      updated: new Date(),
      updater: 'sam.berhane@portlandoregon.gov',
    },
    {
      id: uuid(),
      email: 'anonymous@portlandoregon.gov',
      enabled: false,
      label: 'Hotel Disabled',
      created: new Date(),
      creator: 'sam.berhane@portlandoregon.gov',
      updated: new Date(),
      updater: 'sam.berhane@portlandoregon.gov',
    },
  ]);

  const zones = ref<Array<Zone>>(
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

  const reservations = ref<Array<Reservation>>([
    {
      id: uuid(),
      start: new Date(),
      end: new Date(),
      user: users.value[0],
      zone: zones.value[0],
    },
  ]);

  const addReservation = (res: Reservation) => {
    reservations.value.push(res);
  };

  const disableUser = (u: User) => {
    const user = users.value.find(x => x.id == u.id);

    if (!user) throw Error(`Cannot find user with id '${u.id}`);

    user.enabled = false;
  };

  const enableUser = (u: User) => {
    const user = users.value.find(x => x.id == u.id);

    if (!user) throw Error(`Cannot find user with id '${u.id}`);

    user.enabled = true;
  };

  const addUser = async (u: User) => {
    const store = useAuthStore();

    const currentUser = await store.getUser();
    console.log(currentUser);
    if (!currentUser) throw new Error('Not login in.');
    u.id = uuid();
    u.creator = currentUser.email;
    u.created = new Date();
    u.updater = currentUser.email;
    u.updated = new Date();
    users.value.push(u);
  };

  const user = computed(
    () => (id: string) => users.value.find(x => x.id == id)
  );
  //  => {
  //   const user = users.value.find(x => x.id == u.id);

  //   if (!user) throw Error(`Cannot find user with id '${u.id}`);
  // };

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
    enableUser,
    disableUser,
  };
});
