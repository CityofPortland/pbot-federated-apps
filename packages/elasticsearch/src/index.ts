import { Client, ClientOptions } from '@elastic/elasticsearch';
import DataLoader from 'dataloader';

export function client({
  caFingerprint = process.env.ELASTICSEARCH_CERTIFICATE_FINGERPRINT,
  password = process.env.ELASTICSEARCH_PASSWORD,
  url = process.env.ELASTICSEARCH_URL,
  username = process.env.ELASTICSEARCH_USERNAME,
}) {
  return new Client({
    node: { url: new URL(url) },
    auth: {
      username,
      password,
    },
    caFingerprint,
  });
}

export function dataLoader<TValue>(index: string, options: ClientOptions = {}) {
  return new DataLoader<string, TValue>(async keys =>
    Promise.all(
      keys.map(
        async key =>
          await client(options)
            .get<TValue>({
              index,
              id: key,
            })
            .then(res => ({ ...res._source, _id: res._id }))
      )
    )
  );
}
