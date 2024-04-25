import { RuleType, createAuthStore } from '@pbotapps/authorization';
import { query } from '@pbotapps/components';
import { defineStore } from 'pinia';
import { v4 as uuid } from 'uuid';
import { computed, reactive, ref } from 'vue';

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
  const reservations = reactive<Array<Reservation>>([]);
  const rules = ref<Array<RuleType>>([]);
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

  const addHotel = async (u: User) => {
    const authStore = useAuthStore();
    const token = await authStore.getToken();
    if (!token) throw Error('User not log in');

    const res = await query<{ addHotel: User }>({
      operation: `
      mutation addHotel($hotel: HotelAddInput!) {
        addHotel(payload: $hotel)
        {
          id
          creator
          created
          updater
          updated
          email
          enabled
          label
        }
      }`,
      variables: { hotel: u },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    if (res.data) {
      users.push(res.data.addHotel);
    }
  };

  const editHotel = async (u: User) => {
    const authStore = useAuthStore();
    const token = await authStore.getToken();
    if (!token) throw Error('User not log in');

    const res = await query<{ editHotel: User }>({
      operation: `
      mutation editHotel($id: ID!, $hotel: HotelEditInput!) {
        editHotel(id: $id , payload: $hotel)
        {
          id
          creator
          created
          updater
          updated
          email
          enabled
          label
        }
      }`,
      variables: {
        id: u.id,
        hotel: { email: u.email, enabled: u.enabled, label: u.label },
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    if (res.data) {
      const idx = users.findIndex(x => x.id == u.id);
      if (idx == -1) throw Error(`Cannot find user with id '${u.id}`);
      users[idx] = res.data.editHotel;
    }
  };

  const deleteHotel = async (id: string) => {
    const authStore = useAuthStore();
    const token = await authStore.getToken();
    if (!token) throw Error('User not loggged in');
    await query<{ deleteHotel: boolean }>({
      operation: `
      mutation deleteHotel($hotel: HotelDeleteInput!) {
        deleteHotel(payload: $hotel)
      }`,
      headers: {
        authorization: `Bearer ${token}`,
      },
      variables: {
        hotel: {
          id,
        },
      },
    });

    getHotels();
  };

  const getHotels = async () => {
    const authStore = useAuthStore();
    const token = await authStore.getToken();
    if (!token) throw Error('User not log in');
    const res = await query<{ hotels: User[] }>({
      operation: `
      query getHotels {
        hotels {
          id
          email
          enabled
          label
          creator
          created
          updater
          updated
        }
      }`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    if (res.data) {
      users.splice(0, users.length);
      users.push(...res.data.hotels);
    }
  };

  const getRules = async () => {
    console.debug('getRules');
    const store = useAuthStore();

    const token = await store.getToken();

    if (!token) throw new Error('Must be logged in to get rules!');

    console.debug('query');

    const res = await query<{ rules: RuleType[] }>({
      operation: `
      query getRules {
        rules {
          action
          subject
        }
      }
      `,
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then(res => res.data?.rules);

    if (res) rules.value = res;

    return res;
  };

  const addReservation = async (
    res: Pick<Reservation, 'end' | 'start' | 'user' | 'zone'>
  ) => {
    if (res.end < res.start) throw Error(`End date is before start date`);
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

    if (r.end < r.start) throw Error(`End date is before start date`);

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

  const user = computed(() => (id: string) => users.find(x => x.id == id));
  const reservation = computed(
    () => (id: string) => reservations.find(x => x.id == id)
  );
  const zone = computed(() => (id: string) => zones.find(x => x.id == id));

  return {
    // state
    reservations,
    rules,
    users,
    zones,
    // getters
    user,
    reservation,
    zone,
    // actions
    getHotels,
    addHotel,
    editHotel,
    deleteHotel,
    addReservation,
    editReservation,
    getRules,
  };
});
