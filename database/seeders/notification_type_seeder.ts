import { BaseSeeder } from '@adonisjs/lucid/seeders'
import NotificationType from '#models/notification_type'

export default class extends BaseSeeder {
  async run() {
    await NotificationType.createMany([
      {
        name: 'announcement',
        displayText: 'Announcements',
        groupName: 'App Updates',
        description: 'bla'.repeat(20),
      },
      {
        name: 'feature',
        displayText: 'Feature News',
        groupName: 'App Updates',
        description: 'bla'.repeat(20),
      },
      {
        name: 'liked',
        displayText: 'Liked',
        groupName: 'Community',
        description: 'bla'.repeat(20),
      },
    ])
  }
}
