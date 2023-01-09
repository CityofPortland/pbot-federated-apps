import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema('public').createTable('dataset', table => {
    table.uuid('uuid', { primaryKey: true }).index('pk_dataset').notNullable();
    table.timestamp('created', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('changed', { useTz: true }).defaultTo(knex.fn.now());
    table.uuid('created_by').notNullable();
    table.uuid('changed_by').notNullable();
    table.string('name', 255).notNullable();
    table
      .string('slug', 512)
      .unique({ indexName: 'idx_dataset_slug' })
      .notNullable();
    table.text('summary').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema('public').dropTable('dataset');
}
