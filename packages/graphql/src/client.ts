import axios, { RawAxiosRequestHeaders } from 'axios';

export type QueryOptions = {
  token?: string;
  query: string;
  operationName?: string;
  variables?: Record<string, any>;
};

export async function query(url, { query, token, ...options }: QueryOptions) {
  const headers: Partial<RawAxiosRequestHeaders> = {
    accept: 'application/json',
  };

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  return axios.post(
    url,
    { query: query.replace(/\s+/, ' '), ...options },
    {
      headers,
    }
  );
}
