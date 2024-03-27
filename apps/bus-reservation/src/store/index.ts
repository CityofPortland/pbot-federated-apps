import { createAuthStore } from '@pbotapps/authorization';
import { defineStore } from 'pinia';
import { v4 as uuid } from 'uuid';
import { ref } from 'vue';

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
    },
    {
      id: uuid(),
      email: 'anonymous@portlandoregon.gov',
      enabled: false,
      label: 'Hotel Disabled',
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

  return {
    // state
    reservations,
    users,
    zones,
    // getters
    // actions
    addReservation,
    disableUser,
    enableUser,
  };
});
