import { GraphQLResolverMap } from '@apollo/subgraph/dist/schema-helper';
import { Context } from '@pbotapps/graphql';
import fs from 'fs';
import { DateTimeResolver } from 'graphql-scalars';
import matter from 'gray-matter';

import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import { Page } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const resolvers: GraphQLResolverMap<Context> = {
  Query: {
    page: async (_root, { tree }: { tree: Array<string> }): Promise<Page> => {
      let path = resolve(__dirname, 'pages', ...tree);

      // If this exists with no modification, it *should* be a directory
      //   get the index.md that *should* be there
      // Otherwise this should be referencing a markdown file
      if (fs.existsSync(path)) {
        path = resolve(path, 'index.md');
      } else {
        path = path + '.md';
      }

      if (!fs.existsSync(path)) {
        throw new Error(`'${path}' does not exist!`);
      }

      const { data, content } = matter.read(path);

      return { ...data, content } as Page;
    },
  },
  Page: {},
  DateTime: DateTimeResolver,
};
