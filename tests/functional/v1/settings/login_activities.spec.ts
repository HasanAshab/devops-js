import { test } from '@japa/runner'
import { extract } from '#app/helpers'
import { UserFactory } from '#factories/user_factory'
import { LoggedDeviceFactory } from '#factories/logged_device_factory'

/*
Run this suits:
node ace test  --files="v1/settings/login_activities.spec.ts"
*/
test.group('V1 / Settings / Login Activities', () => {
  test('should get login activities', async ({ client }) => {
    const user = await UserFactory.create()
    const loggedDevices = await LoggedDeviceFactory.createMany(3)
    for (const device of loggedDevices) {
      await user.createTrackableToken(device, '127.0.0.1')
    }

    const response = await client
      .get('/api/v1/settings/login-activities')
      .usingDevice(loggedDevices[0])
      .loginAs(user)

    response.assertStatus(200)
    response.assertBodyContainProperty('data', extract(loggedDevices, 'id'))
  })
})
