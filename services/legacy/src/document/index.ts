import fs from 'fs';
import {
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import Metalsmith, { Files } from 'metalsmith';
import markdown from '@metalsmith/markdown';
import path, { dirname } from 'path';
import simpleGit, { SimpleGit } from 'simple-git';
import { fileURLToPath } from 'url';

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

for (const document in database) {
  const dir = path.resolve(__dirname, 'document', document);

  if (!fs.existsSync(dir)) {
    const git: SimpleGit = simpleGit();
    await git.clone(database[document].repository, dir);
  }
}

for (const document of Object.keys(database)) {
  const dir = path.resolve(__dirname, 'document', document);

  if (!fs.existsSync(dir)) {
    const git: SimpleGit = simpleGit();
    await git.clone(database[document].repository, dir);
  }

  const git: SimpleGit = simpleGit(dir);

  await git.pull();
  await git.checkout(database[document].branch);
}

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

let refreshing = false;

export const getDocument = (documentName: string): Promise<Section[]> =>
  new Promise<Section[]>((resolve, reject) => {
    if (
      Object.keys(database).findIndex(value => value === documentName) == -1
    ) {
      reject(
        new Error(`No document named ${documentName} in list of documents.`)
      );
    }

    Metalsmith(__dirname)
      .source(
        path.resolve(
          __dirname,
          'document',
          documentName,
          database[documentName].subDir || ''
        )
      )
      .ignore('.git')
      .destination(`./build/${documentName}`)
      .clean(true)
      .use(markdown())
      .build((err: Error | null, files: Files) => {
        if (err) {
          reject(err);
          return;
        }

        const sections = new Array<Section>();

        Object.keys(files).forEach(key => {
          const text = files[key];

          try {
            const tree: number[] = text.tree;

            // ignore files that aren't attached to a tree
            if (tree) {
              const section: Section = {
                id: text.id,
                name: text.name,
                number: tree.pop(),
                tree: [...tree],
                depth: tree.length,
                content: text.contents.toString(),
              };

              sections.push(section);
            }
          } catch (error) {
            console.error(`Error parsing ${key}: ${JSON.stringify(error)}`);
          }
        });

        resolve(sections);
      });

    if (!refreshing) {
      refreshing = true;
      const git: SimpleGit = simpleGit(
        path.resolve(__dirname, 'document', documentName)
      );
      try {
        git.pull('origin', database[documentName].branch);
      } finally {
        refreshing = false;
      }
    }
  });
