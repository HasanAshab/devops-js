import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class CreateTestUser extends BaseCommand {
  static commandName = 'create:user'
  static description = 'Creates a user for testing purpose'
  static options: CommandOptions = { startApp: true }

  async run() {
    const { default: User } = await import('#models/user')
    const user = await User.factory().create()
    const token = await user.createToken()

    this.logger.info('User data: ')
    console.log(user.serialize(), '\n\n')
    this.logger.success('Token: ' + token.value.release())
  }
}
