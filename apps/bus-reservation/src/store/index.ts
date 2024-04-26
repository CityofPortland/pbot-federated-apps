import { RuleType, createAuthStore } from '@pbotapps/authorization';
import { query } from '@pbotapps/components';
import { defineStore } from 'pinia';
import { v4 as uuid } from 'uuid';
import { computed, reactive, ref } from 'vue';

export type Spot = {
  id: string; //UUID
  label: string;
  zone: string;
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
  spot: Spot;
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
  const spots = reactive<Array<Spot>>([]);

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

  const getSpots = async () => {
    const authStore = useAuthStore();
    const token = await authStore.getToken();
    if (!token) throw Error('User not log in');
    const res = await query<{ spots: Spot[] }>({
      operation: `
      {
        spots {
          id
          label
          zone
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
      spots.splice(0, spots.length);
      spots.push(...res.data.spots);
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
          spot {
            id
            label
            zone
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
    res: Pick<Reservation, 'end' | 'start' | 'hotel' | 'spot'>
  ) => {
    if (res.end < res.start) throw Error(`End date is before start date`);
    const existing = reservations
      .reduce((acc, curr) => {
        if (curr.spot.id == res.spot.id) {
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
        `There is an existing reservation in ${res.spot.label} on the same dates`
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
          spot {
            id
            label
            zone
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
          spotId: res.spot.id,
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
    spotId: string,
    res: Pick<Reservation, 'active' | 'end' | 'start' | 'spot' | 'hotel'>
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
          if (curr.spot.id == res.spot.id) {
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
          `There is an existing reservation in ${res.spot.label} on the same dates`
        );
      }
    }

    const authStore = useAuthStore();
    const token = await authStore.getToken();
    if (!token) throw Error('User not loggged in');

    const response = await query<{ editReservation: Reservation }>({
      operation: `
      mutation editReservation($id: ID!, $spotId: ID!, $res: ReservationEditInput!) {
        editReservation(id: $id, spotId: $spotId, payload: $res)
        { 
          id  
          creator
          created
          updater
          updated
          start
          end
          active
          spot {
            id
            label
            zone
          }
          hotel {
            id
            label
          }
        }
      }`,
      variables: {
        id,
        spotId,
        res: {
          hotelId: res.hotel.id,
          spotId: res.spot.id,
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
  const spot = computed(() => (id: string) => spots.find(x => x.id == id));
  const zones = computed(() =>
    spots.reduce((acc, curr) => {
      acc.add(curr.zone);
      return acc;
    }, new Set<string>())
  );

  return {
    // state
    reservations,
    rules,
    hotels,
    spots,
    // getters
    hotel,
    reservation,
    spot,
    zones,
    // actions
    getHotels,
    getSpots,
    getReservations,
    addHotel,
    editHotel,
    addReservation,
    editReservation,
    getRules,
  };
});
