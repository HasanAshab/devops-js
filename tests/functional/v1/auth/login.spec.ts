import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import type User from '#models/user'
import { UserFactory } from '#factories/user_factory'
import { LoggedDeviceFactory } from '#factories/logged_device_factory'

/*
Run this suits:
node ace test functional --files="v1/auth/login.spec.ts"
*/
test.group('Auth / Login', (group) => {
  let user: User

  refreshDatabase(group)

  group.each.setup(async () => {
    user = await UserFactory.create()
  })

  test('should login a user', async ({ client }) => {
    const response = await client.post('/api/v1/auth/login').deviceId('device-id').json({
      email: user.email,
      password: 'password',
    })

    response.assertStatus(200)
    response.assertBodyHaveProperty('data.token')
  })

  test("shouldn't login with wrong password", async ({ client }) => {
    const response = await client.post('/api/v1/auth/login').deviceId('device-id').json({
      email: user.email,
      password: 'wrong-pass',
    })

    response.assertStatus(401)
    response.assertBodyNotHaveProperty('data.token')
  })

  test("shouldn't login manually in social account", async ({ client }) => {
    user = await UserFactory.apply('social').create()
    const response = await client.post('/api/v1/auth/login').deviceId('device-id').json({
      email: user.email,
      password: 'password',
    })

    response.assertStatus(401)
    response.assertBodyNotHaveProperty('data.token')
  })

  test('should prevent Brute Force login', async ({ client }) => {
    const limit = 5
    const responses = []
    const payload = {
      email: user.email,
      password: 'wrong-pass',
    }

    for (let i = 0; i < limit; i++) {
      const response = await client.post('/api/v1/auth/login').deviceId('device-id').json(payload)
      responses.push(response)
    }

    const lockedResponse = await client
      .post('/api/v1/auth/login')
      .deviceId('device-id')
      .json(payload)

    responses.forEach((response) => {
      response.assertStatus(401)
    })
    lockedResponse.assertStatus(429)
  })

  test('Login should flag for two factor auth on 2FA enabled account', async ({ client }) => {
    user = await UserFactory.apply('hasPhoneNumber').apply('twoFactorAuthenticableThroughAuthenticator').create()

    const response = await client.post('/api/v1/auth/login').deviceId('device-id').json({
      email: user.email,
      password: 'password',
    })

    response.assertStatus(202)
    response.assertBodyNotHaveProperty('data.token')
    response.assertBodyHaveProperty('twoFactor', true)
  })

  test('Should login with trusted device on 2FA enabled account', async ({ client }) => {
    user = await UserFactory.apply('hasPhoneNumber').apply('twoFactorAuthenticableThroughAuthenticator').create()
    const device = await LoggedDeviceFactory.create()
    await user.trustDevice(device, '127.0.0.1')

    const response = await client.post('/api/v1/auth/login').usingDevice(device).json({
      email: user.email,
      password: 'password',
    })

    response.assertStatus(200)
    response.assertBodyHaveProperty('data.token')
  })
})
