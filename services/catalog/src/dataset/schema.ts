import { GraphQLSchemaModule } from '@apollo/subgraph/dist/schema-helper';

import resolvers from './resolver';
import { typeDefs } from './type';

export default { typeDefs, resolvers } as GraphQLSchemaModule;
