import fs from 'fs';
import {
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import Metalsmith from 'metalsmith';
import markdown from '@metalsmith/markdown';
import path, { dirname } from 'path';
import { simpleGit } from 'simple-git';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { createDocumentCache } from './cache.js';
import { errorProperties, getLogger } from '../logging.js';

const logger = getLogger(['legacy', 'document']);

// eslint-disable-next-line @typescript-eslint/naming-convention
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = dirname(__filename);

type Document = {
  repository: string;
  branch: string;
  subDir?: string;
};

const database = {
  'transportation-system-plan': {
    repository: 'https://github.com/CityofPortland/transportation-system-plan',
    branch: 'master',
  },
} as { [document: string]: Document };

export type Language = {
  code: string;
};

export type Section = {
  id?: string;
  number?: number;
  tree: number[];
  depth: number;
  name?: string;
  content?: string;
};

export const sectionType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Section',
  description:
    'A section of text in a Portland Bureau of Transportaiton document.',
  fields: {
    id: {
      type: GraphQLString,
      description: 'The id of the section, for routing.',
    },
    number: {
      type: GraphQLInt,
      description:
        'The section number within the parent section, for sorting purposes.',
    },
    depth: {
      type: GraphQLInt,
      description:
        'The section number within the parent section, for sorting purposes.',
    },
    tree: {
      type: new GraphQLList(GraphQLInt),
      description: 'The tree of parent section numbers.',
    },
    name: {
      type: GraphQLString,
      description: 'The display name of the section.',
    },
    content: {
      type: GraphQLString,
      description: 'The stringified HTML content of the section.',
    },
  },
});

const configuredRefreshInterval = Number(
  process.env.DOCUMENT_REFRESH_INTERVAL_MS
);
const refreshInterval =
  Number.isFinite(configuredRefreshInterval) && configuredRefreshInterval > 0
    ? configuredRefreshInterval
    : 5 * 60 * 1000;

const readRevision = async (documentName: string): Promise<string> => {
  logger.debug('Checking document revision', { document: documentName });
  const document = database[documentName];

  const dir = path.resolve(__dirname, 'document', documentName);

  if (!fs.existsSync(dir)) {
    await simpleGit().clone(document.repository, dir, [
      '--branch',
      document.branch,
      '--single-branch',
    ]);
  } else {
    const git = simpleGit(dir);
    await git.checkout(document.branch);
    await git.pull('origin', document.branch, ['--ff-only']);
  }

  return simpleGit(dir).revparse(['HEAD']);
};

const compile = async (documentName: string): Promise<Section[]> => {
  const started = performance.now();
  logger.debug('Compiling document', { document: documentName });
  const files = await Metalsmith(__dirname)
    .source(
      path.resolve(
        __dirname,
        'document',
        documentName,
        database[documentName].subDir || ''
      )
    )
    .ignore('.git')
    .use(markdown())
    .process();

  const sections: Section[] = [];

  for (const [, text] of Object.entries(files)) {
    // Ignore files that aren't attached to a tree.
    if (text.tree === undefined || text.tree === null) {
      continue;
    }

    const metadata = await z
      .object({
        tree: z.array(z.number().int()),
        id: z.string().optional(),
        name: z.string().optional(),
      })
      .parseAsync(text);

    sections.push({
      id: metadata.id,
      name: metadata.name,
      number: metadata.tree[metadata.tree.length - 1],
      tree: metadata.tree,
      depth: metadata.tree.length,
      content: text.contents.toString(),
    });
  }
  logger.debug('Document compiled', {
    document: documentName,
    count: sections.length,
    durationMs: performance.now() - started,
  });
  return sections;
};

const cachedDocument = createDocumentCache<Section[]>({
  refreshInterval,
  readRevision,
  compile,
  onError: (name, error) => {
    logger.error('Document refresh failed', {
      document: name,
      ...errorProperties(error),
    });
  },
});

export const getDocument = async (documentName: string): Promise<Section[]> => {
  if (!Object.prototype.hasOwnProperty.call(database, documentName)) {
    throw new Error(`No document named ${documentName} in list of documents.`);
  }
  return cachedDocument(documentName);
};
