import axios from 'axios';
import sha256 from 'crypto-js/sha256';

type GraphQLError = {
  message: string;
  locations: Array<{ line: number; column: number }>;
};

export type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<GraphQLError>;
};

const cache: Map<string, GraphQLResponse<unknown>> = new Map();

export async function query<T>(q: string): Promise<GraphQLResponse<T>> {
  if (!process.env.VUE_APP_GRAPHQL_URL) {
    throw Error(
      'VUE_APP_GRAPHQL_URL is not defined and required to query the GraphQL server!'
    );
  }

  q = q.replace(/\s+/g, ' ').trim();

  const hash = sha256(q).toString();

  if (cache.has(hash)) {
    return cache.get(hash) as GraphQLResponse<T>;
  }

  const res = await axios.post<GraphQLResponse<T>>(
    process.env.VUE_APP_GRAPHQL_URL,
    {
      query: q,
    },
    {
      headers: {
        'content-type': 'application/json',
      },
    }
  );

  cache.set(hash, res.data);

  return res.data;
}
