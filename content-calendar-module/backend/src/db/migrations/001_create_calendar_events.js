exports.up = async (knex) => {
  await knex.schema.createTable('calendar_events', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.date('date').notNullable();
    table.string('type').notNullable(); // 'holiday', 'social', 'custom'
    table.text('description');
    table.json('tags'); // Store as JSON array
    table.string('country_code'); // For country-specific holidays
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    // Indexes for performance
    table.index(['date']);
    table.index(['type']);
    table.index(['is_active']);
  });

  // Create user industries table for filtering
  await knex.schema.createTable('user_industries', (table) => {
    table.increments('id').primary();
    table.string('user_id').notNullable();
    table.string('industry').notNullable();
    table.boolean('is_primary').defaultTo(false);
    table.timestamps(true, true);
    
    table.unique(['user_id', 'industry']);
    table.index(['user_id']);
  });

  // Create table for AI prompt cache
  await knex.schema.createTable('ai_prompt_cache', (table) => {
    table.increments('id').primary();
    table.string('event_name').notNullable();
    table.string('industry').notNullable();
    table.json('prompts').notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamps(true, true);
    
    table.unique(['event_name', 'industry']);
    table.index(['expires_at']);
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('ai_prompt_cache');
  await knex.schema.dropTableIfExists('user_industries');
  await knex.schema.dropTableIfExists('calendar_events');
};