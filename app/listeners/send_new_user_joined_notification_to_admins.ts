import type Registered from '#events/registered'
import Notification from '@ioc:verful/notification'
import NewUserJoinedNotification from '#notifications/new_user_joined_notification'
import User from '#models/user'

export default class SendNewUserJoinedNotificationToAdmins {
  async handle(event: Registered) {
    const admins = await User.apply('admin')
      .preload('notificationPreferences')
      .except(event.user)
    await Notification.send(admins, new NewUserJoinedNotification(event.user))
  }
}
