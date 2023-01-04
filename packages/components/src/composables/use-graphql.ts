import axios, { AxiosRequestHeaders } from 'axios';
import sha256 from 'crypto-js/sha256';

type GraphQLError = {
  message: string;
  locations: Array<{ line: number; column: number }>;
};

type GraphQLOptions = {
  operation: string;
  headers?: AxiosRequestHeaders;
  variables?: Record<string, unknown>;
};

export type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<GraphQLError>;
};

const cache: Map<string, GraphQLResponse<unknown>> = new Map();

export async function query<T>(
  options: GraphQLOptions
): Promise<GraphQLResponse<T>> {
  if (!import.meta.env.VITE_GRAPHQL_URL) {
    throw Error(
      'GRAPHQL_URL is not defined and required to query the GraphQL server!'
    );
  }

  let { operation } = options;

  operation = operation.replace(/\s+/g, ' ').trim();

  const hash = sha256(operation).toString();

  if (cache.has(hash)) {
    return cache.get(hash) as GraphQLResponse<T>;
  }

  const body = {
    query: operation,
    variables: options && options.variables,
  };

  const headers = options && options.headers;

  const res = await axios.post<GraphQLResponse<T>>(
    import.meta.env.VITE_GRAPHQL_URL,
    body,
    {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    }
  );

  cache.set(hash, res.data);

  return res.data;
}
