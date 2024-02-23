import { GraphQLResolverMap } from '@apollo/subgraph/dist/schema-helper';
import { Context } from '@pbotapps/graphql';

import sources from '../data-source.js';
import { Pipeline } from './types.js';

export const resolvers: GraphQLResolverMap<Context> = {
  Query: {
    pipeline: (_root, { id }) =>
      sources.airflow
        .columns({
          id: 'dag_id',
          schedule: 'schedule_interval',
        })
        .select()
        .from('dag')
        .where('dag_id', id),
    pipelines: () =>
      sources.airflow
        .columns({
          id: 'dag_id',
          schedule: 'schedule_interval',
        })
        .select()
        .from('dag'),
  },
  Pipeline: {
    lastRun: (p: Pipeline) =>
      sources.airflow
        .columns({
          id: 'dag_hash',
          status: 'state',
          startTime: 'start_date',
          endTime: 'end_date',
        })
        .select()
        .from('dag_run')
        .where('dag_id', p.id)
        .orderBy('execution_date', 'desc')
        .limit(1)
        .then(runs => runs.shift()),
    tags: (p: Pipeline) =>
      sources.airflow
        .columns({
          name: 'name',
        })
        .select()
        .from('dag_tag')
        .where('dag_id', p.id)
        .then(tags => tags.map(t => t.name)),
  },
};

export default resolvers;
