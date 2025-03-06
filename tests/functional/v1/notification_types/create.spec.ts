import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import type User from '#models/user'
import NotificationType from '#models/notification_type'
import { UserFactory } from '#factories/user_factory'
import { NotificationTypeFactory } from '#factories/notification_type_factory'

/*
Run this suits:
node ace test functional --files="v1/notification_types/create.spec.ts"
*/
test.group('Notification Types / Create', (group) => {
  let admin: User

  refreshDatabase(group)

  group.each.setup(async () => {
    admin = await UserFactory.apply('admin').create()
  })

  test('Should create notification type', async ({ client, expect }) => {
    const data = {
      name: 'name',
      displayText: 'Text',
      groupName: 'Group Name',
      description: 'description bla bla ...',
    }

    const response = await client.post('/api/v1/notification-types/').loginAs(admin).json(data)

    response.assertStatus(201)
    await expect(NotificationType.exists(data)).resolves.toBeTrue()
  })

  test('Users should not create notification type', async ({ client, expect }) => {
    const user = await UserFactory.create()
    const data = {
      name: 'name',
      displayText: 'Text',
      groupName: 'Group Name',
      description: 'description bla bla ...',
    }

    const response = await client.post('/api/v1/notification-types/').loginAs(user).json(data)

    response.assertStatus(403)
    await expect(NotificationType.exists(data)).resolves.toBeFalse()
  })

  test('Should create notification type with existing name', async ({ client, expect }) => {
    const existingNotificationType = await NotificationTypeFactory.create()
    const data = {
      name: existingNotificationType.name,
      displayText: 'Text',
      groupName: 'Group Name',
      description: 'description bla bla ...',
    }

    const response = await client.post('/api/v1/notification-types').loginAs(admin).json(data)

    response.assertStatus(422)
    await expect(NotificationType.exists(data)).resolves.toBeFalse()
  })
})
