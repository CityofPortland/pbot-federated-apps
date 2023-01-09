import qs from 'querystring';

import axios from 'axios';

import { AddressCandidate } from '@/address/types';
import { SpatialReference } from '@/types';

const axiosInstance = axios.create({
  baseURL: 'https://www.portlandmaps.com/api',
  headers: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'Content-Type': 'application/x-www-form-urlencoded'
  }
});

axiosInstance.interceptors.request.use((config) => {
  config.data.api_key = process.env.PORTLANDMAPS_API_KEY;
  config.data = qs.stringify(config.data);

  return config;
});

export default axiosInstance;

export type SuggestResult = {
  status: string;
  spatialReference: SpatialReference;
  candidates: AddressCandidate[];
};

export type AssessorResult = {
  total: number;
  status: string;
  results: any[];
};
