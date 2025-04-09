import axios, { type RawAxiosRequestHeaders } from 'axios';
import sha256 from 'crypto-js/sha256';

export type GraphQLError = {
  message: string;
  locations: Array<{ line: number; column: number }>;
};

export type GraphQLOptions = {
  operation: string;
  url?: string;
  headers?: RawAxiosRequestHeaders;
  variables?: Record<string, unknown>;
  cache?: boolean;
};

export type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<GraphQLError>;
};

const cache: Map<string, GraphQLResponse<unknown>> = new Map();

// Helper function to resolve GraphQL URL
function getGraphQLUrl(options: GraphQLOptions): string {
  const url = options.url || import.meta.env.VITE_GRAPHQL_URL;
  
  if (!url) {
    throw Error(
      'GraphQL URL is not defined! Either provide a url in options or set VITE_GRAPHQL_URL environment variable.'
    );
  }
  
  return url;
}

export async function query<T>(
  options: GraphQLOptions
): Promise<GraphQLResponse<T>> {
  const url = getGraphQLUrl(options);

  let { operation } = options;

  operation = operation.replace(/\s+/g, ' ').trim();

  const hash = sha256(operation).toString();

  if (options.cache && cache.has(hash)) {
    return cache.get(hash) as GraphQLResponse<T>;
  }

  const body = {
    query: operation,
    variables: options && options.variables,
  };

  const headers = options && options.headers;

  const res = await axios.post<GraphQLResponse<T>>(
    url,
    body,
    {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    }
  );

  if (options.cache) {
    cache.set(hash, res.data);
  }

  return res.data;
}

export async function formData<T>(
  options: GraphQLOptions,
  files: Array<File> | FileList,
  map: Map<string, string>
): Promise<GraphQLResponse<T>> {
  const url = getGraphQLUrl(options);

  let { operation } = options;

  operation = operation.replace(/\s+/g, ' ').trim();

  const body = new FormData();

  body.append(
    'operations',
    JSON.stringify({
      query: operation,
      variables: options.variables,
    })
  );

  const headers = options && options.headers;

  const mapObj: Record<string, Array<string>> = {}
  for (const entry of map.entries()) {
    mapObj[entry[1]] = [entry[0]]
  }

  body.append(
    'map',
    JSON.stringify(mapObj)
  );

  let index = 0;
  for (const file of files) {
    body.append((index++).toLocaleString(), file);
  }

  const res = await axios.post<GraphQLResponse<T>>(
    url,
    body,
    {
      headers: {
        ...headers,
        'apollo-require-preflight': 'False',
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return res.data;
}
