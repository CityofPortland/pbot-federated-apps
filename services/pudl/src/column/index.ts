import { GraphQLSchemaModule } from '@apollo/subgraph/dist/schema-helper';

import resolvers from './resolvers.js';
import typeDefs from './types.js';

export default { typeDefs, resolvers } as GraphQLSchemaModule;
