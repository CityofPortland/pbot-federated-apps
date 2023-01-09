import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema('public').createTable('user', table => {
    table.uuid('uuid', { primaryKey: true }).index('pk_user').notNullable();
    table.timestamp('created', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('changed', { useTz: true }).defaultTo(knex.fn.now());
    table
      .string('email', 255)
      .unique({ indexName: 'idx_user_email' })
      .notNullable();
    table.string('first_name', 255).notNullable();
    table.string('last_name', 255).notNullable();
    table.uuid('oauth_id').index('idx_user_oauth_id').notNullable();
  });

  await knex.schema.withSchema('public').createTable('application', table => {
    table
      .uuid('uuid', { primaryKey: true })
      .index('pk_application')
      .notNullable();
    table.timestamp('created', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('changed', { useTz: true }).defaultTo(knex.fn.now());
    table.uuid('created_by').notNullable();
    table.uuid('changed_by').notNullable();
    table.string('name', 255).notNullable();
    table
      .string('slug', 512)
      .unique({ indexName: 'idx_application_slug' })
      .notNullable();
    table.text('description').nullable();
  });

  await knex.schema.withSchema('public').createTable('rule', table => {
    table.uuid('uuid', { primaryKey: true }).index('pk_rule').notNullable();
    table.timestamp('created', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('changed', { useTz: true }).defaultTo(knex.fn.now());
    table.uuid('created_by').notNullable();
    table.uuid('changed_by').notNullable();
    table.uuid('application_uuid').notNullable();
    table.boolean('inverted').defaultTo(false);
    table.string('subject').notNullable();
    table.string('action').notNullable();
    table.jsonb('conditions').nullable();
    table.jsonb('fields').nullable();

    table
      .foreign('application_uuid', 'fk_rule_application')
      .references('uuid')
      .inTable('application');
  });

  await knex.schema.withSchema('public').createTable('user_rule', table => {
    table.uuid('user_uuid').notNullable();
    table.uuid('rule_uuid').notNullable();

    table.primary(['user_uuid', 'rule_uuid'], {
      constraintName: 'pk_user_rule',
    });
    table
      .foreign('user_uuid', 'fk_user_rule_user_uuid')
      .references('uuid')
      .inTable('user');
    table
      .foreign('rule_uuid', 'fk_user_rule_rule_uuid')
      .references('uuid')
      .inTable('rule');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema('public').dropTable('user_rule');
  await knex.schema.withSchema('public').dropTable('user');
  await knex.schema.withSchema('public').dropTable('rule');
  await knex.schema.withSchema('public').dropTable('application');
}
