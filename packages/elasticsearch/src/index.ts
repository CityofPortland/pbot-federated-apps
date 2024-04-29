import { Client, ClientOptions } from '@elastic/elasticsearch';
import { SearchRequest } from '@elastic/elasticsearch/lib/api/types.js';
import DataLoader from 'dataloader';

export function createClient({
  caFingerprint = process.env.ELASTICSEARCH_CERTIFICATE_FINGERPRINT,
  password = process.env.ELASTICSEARCH_PASSWORD,
  url = process.env.ELASTICSEARCH_URL,
  username = process.env.ELASTICSEARCH_USERNAME,
}) {
  const options: ClientOptions = {
    node: url,
  };

  if (password && username) {
    options.auth = {
      username,
      password,
    };
  }

  if (caFingerprint) {
    options.caFingerprint = caFingerprint;
  }

  return new Client(options);
}

export function dataLoader<TValue>(index: string, options: ClientOptions = {}) {
  return new DataLoader<string, TValue>(async keys =>
    Promise.all(
      keys.map(
        async key =>
          await createClient(options)
            .get<TValue>({
              index,
              id: key,
            })
            .then(res => ({ ...res._source, _id: res._id }))
      )
    )
  );
}

export async function* scrollSearch<T>(client: Client, params: SearchRequest) {
  let response = await client.search<T>(params);

  while (true) {
    const sourceHits = response.hits.hits;

    if (sourceHits.length === 0) {
      break;
    }

    for (const hit of sourceHits) {
      yield hit;
    }

    if (!response._scroll_id) {
      break;
    }

    response = await client.scroll({
      scroll_id: response._scroll_id,
      scroll: params.scroll,
    });
  }
}
