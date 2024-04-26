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

export type Hotel = {
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
  id: string; //UUID=
  hotel: Hotel;
  zone: Zone;
  start: Date;
  end: Date;
  active: boolean;
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
  const hotels = reactive<Array<Hotel>>([]);
  const zones = reactive<Array<Zone>>([]);

  const addHotel = async (u: Hotel) => {
    const authStore = useAuthStore();
    const token = await authStore.getToken();
    if (!token) throw Error('User not log in');

    const res = await query<{ addHotel: Hotel }>({
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

    if (res.errors) {
      throw new Error(res.errors.map(e => e.message).join('\n'));
    }

    if (res.data) {
      hotels.push(res.data.addHotel);
    }
  };

  const editHotel = async (u: Hotel) => {
    const authStore = useAuthStore();
    const token = await authStore.getToken();
    if (!token) throw Error('User not log in');

    const res = await query<{ editHotel: Hotel }>({
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

    if (res.errors) {
      throw new Error(res.errors.map(e => e.message).join('\n'));
    }

    if (res.data) {
      const idx = hotels.findIndex(x => x.id == u.id);
      if (idx == -1) throw Error(`Cannot find user with id '${u.id}`);
      hotels[idx] = res.data.editHotel;
    }
  };

  const getHotels = async () => {
    const authStore = useAuthStore();
    const token = await authStore.getToken();
    if (!token) throw Error('User not log in');
    const res = await query<{ hotels: Hotel[] }>({
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

    if (res.errors) {
      throw new Error(res.errors.map(e => e.message).join('\n'));
    }

    if (res.data) {
      hotels.splice(0, hotels.length);
      hotels.push(...res.data.hotels);
    }
  };

  const getZones = async () => {
    const authStore = useAuthStore();
    const token = await authStore.getToken();
    if (!token) throw Error('User not log in');
    const res = await query<{ zones: Zone[] }>({
      operation: `
      {
        zones {
          id
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
      zones.splice(0, zones.length);
      zones.push(...res.data.zones);
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

  const getReservations = async () => {
    const res = await query<{ reservations: Reservation[] }>({
      operation: `
      {
        reservations(active:true) {
          id
          zone {
            id
            label
          }
          hotel {
            id
            label
          }
          start
          end
          active
          creator
          created
          updater
          updated
        }
      }`,
    });

    if (res.errors) {
      throw new Error(res.errors.map(e => e.message).join('\n'));
    }

    if (res.data) {
      reservations.splice(0, reservations.length);
      reservations.push(
        ...res.data.reservations.map(r => {
          return {
            ...r,
            created: new Date(r.created),
            updated: new Date(r.updated),
            start: new Date(r.start),
            end: new Date(r.end),
          };
        })
      );
    }
  };

  const addReservation = async (
    res: Pick<Reservation, 'end' | 'start' | 'hotel' | 'zone'>
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

    const authStore = useAuthStore();
    const token = await authStore.getToken();
    if (!token) throw Error('User not log in');

    const response = await query<{ addReservation: Reservation }>({
      operation: `
      mutation addReservation($res: ReservationAddInput!) {
        addReservation(payload: $res)
        { 
          id  
          creator
          created
          updater
          updated
          start
          end
          zone {
            id
            label
          }
          hotel {
            id
            label
          }
        }
      }`,
      variables: {
        res: {
          hotelId: res.hotel.id,
          zoneId: res.zone.id,
          start: res.start,
          end: res.end,
        },
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    if (response.errors) {
      throw new Error(response.errors.map(e => e.message).join('\n'));
    }

    if (response.data) {
      getReservations();
    }
  };

  const editReservation = async (
    id: string,
    zoneId: string,
    res: Pick<Reservation, 'active' | 'end' | 'start' | 'zone' | 'hotel'>
  ) => {
    // only check validity if this is going to be an active reservation
    if (res.active) {
      if (res.end < res.start) throw Error(`End date is before start date`);

      const existing = reservations
        .reduce((acc, curr) => {
          if (curr.id != id) {
            acc.push(curr);
          }
          return acc;
        }, new Array<Reservation>())
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
    }

    const authStore = useAuthStore();
    const token = await authStore.getToken();
    if (!token) throw Error('User not loggged in');

    const response = await query<{ editReservation: Reservation }>({
      operation: `
      mutation editReservation($id: ID!, $zoneId: ID!, $res: ReservationEditInput!) {
        editReservation(id: $id, zoneId: $zoneId, payload: $res)
        { 
          id  
          creator
          created
          updater
          updated
          start
          end
          active
          zone {
            id
            label
          }
          hotel {
            id
            label
          }
        }
      }`,
      variables: {
        id,
        zoneId,
        res: {
          hotelId: res.hotel.id,
          zoneId: res.zone.id,
          start: res.start,
          end: res.end,
          active: res.active,
        },
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    if (response.errors) {
      throw new Error(response.errors.map(e => e.message).join('\n'));
    }

    if (response.data?.editReservation) {
      getReservations();
    }
  };

  const hotel = computed(() => (id: string) => hotels.find(x => x.id == id));
  const reservation = computed(
    () => (id: string) => reservations.find(x => x.id == id)
  );
  const zone = computed(() => (id: string) => zones.find(x => x.id == id));

  return {
    // state
    reservations,
    rules,
    hotels,
    zones,
    // getters
    hotel,
    reservation,
    zone,
    // actions
    getHotels,
    getZones,
    getReservations,
    addHotel,
    editHotel,
    addReservation,
    editReservation,
    getRules,
  };
});
