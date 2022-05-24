import { createStore } from 'vuex';

import axios from 'axios';

import { AreaPermit, AreaPermitZone, GraphQLResponse, State } from './types';

async function submitQuery<T>(query: unknown) {
  if (!process.env.VUE_APP_GRAPHQL_URL) {
    throw Error(
      'VUE_APP_GRAPHQL_URL is not defined and required to query the GraphQL server!'
    );
  }

  return axios.post<GraphQLResponse<T>>(
    process.env.VUE_APP_GRAPHQL_URL,
    query,
    {
      headers: {
        'content-type': 'application/json',
      },
    }
  );
}

export default createStore<State>({
  state: {
    loading: false,
    zones: new Array<AreaPermitZone>(),
    permit: undefined,
  },
  mutations: {
    setLoading(state, loading: boolean) {
      state.loading = loading;
    },
    setZones(state, zones: Array<AreaPermitZone>) {
      state.zones = zones;
    },
    setPermit(state, permit: AreaPermit) {
      state.permit = permit;
    },
    setError(state, message: string) {
      state.error = message;
    },
  },
  actions: {
    async retrieveZones({ state, commit }) {
      if (!state.zones.length) {
        try {
          const res = await submitQuery<{ areaPermitZone: AreaPermitZone }>({
            query: '{ areaPermitZone { id displayName subSection } }',
          });
          commit('setZones', res.data.data?.areaPermitZone);
        } catch (err) {
          commit('setError', 'Error while contacting server.');
        }
      }
    },
    async searchLicense({ commit }, { licensePlate, zone }) {
      commit('setLoading', true);
      commit('setPermit', null);

      try {
        const res = await submitQuery<{ areaPermit: AreaPermit }>({
          query: `{ areaPermit(licensePlate:"${licensePlate}", zone:"${zone}") {
            licensePlate, zone { id }, isValid
          } }`,
        });

        commit('setPermit', res.data.data?.areaPermit);
      } catch (err) {
        commit('setError', 'Error on search.');
      } finally {
        commit('setLoading', false);
      }
    },
  },
  modules: {},
});
