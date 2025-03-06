import { BaseSchema } from '@adonisjs/lucid/schema'
import twoFactorMethod from '#services/auth/two_factor/two_factor_method_manager'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('two_factor_enabled').notNullable()
      table.enum('two_factor_method', twoFactorMethod.names()).nullable()
      table.string('two_factor_secret').nullable()
      table.text('two_factor_recovery_codes').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('two_factor_enabled')
      table.dropColumn('two_factor_method')
      table.dropColumn('two_factor_secret')
      table.dropColumn('two_factor_recovery_codes')
    })
  }
}
