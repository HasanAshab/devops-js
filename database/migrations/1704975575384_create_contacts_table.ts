import config from '@adonisjs/core/services/config'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'contacts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('email', config.get('app.user.email.maxLength')).notNullable()
      table.string('subject', config.get('app.contact.subject.maxLength')).notNullable().index()
      table.string('message', config.get('app.contact.message.maxLength')).notNullable()
      table.enum('status', ['opened', 'closed']).notNullable()
      table.timestamp('created_at')
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        ALTER TABLE ${this.tableName}
        ADD COLUMN search_vector tsvector
        GENERATED ALWAYS AS (to_tsvector('english', coalesce(subject, '') || ' ' || coalesce(message, ''))) STORED;
      `)

      await db.rawQuery(`
        CREATE INDEX textsearch_idx ON ${this.tableName} USING GIN (search_vector);
      `)
    })
  }

  async down() {
    this.schema.dropTableIfExists(this.tableName)
  }
}
