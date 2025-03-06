import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import { UserFactory } from '#factories/user_factory'


/*
Run this suits:
node ace test functional --files="v1/users/password.spec.ts"
*/
test.group('Users/Password', (group) => {
  refreshDatabase(group)

  test('should change password', async ({ client, expect }) => {
    const user = await UserFactory.create()
    const newPassword = 'Password@1234'

    const response = await client.patch('/api/v1/users/me/password').loginAs(user).json({
      oldPassword: 'password',
      newPassword
    })
    await user.refresh()

    response.assertStatus(200)
    await expect(user.comparePassword(newPassword)).resolves.toBeTrue()
  })

  test("shouldn't change password of social account", async ({ client, expect }) => {
    const user = await UserFactory.apply('social').create()

    const response = await client.patch('/api/v1/users/me/password').loginAs(user).json({
      oldPassword: 'password',
      newPassword: 'Password@1234',
    })
    await user.refresh()

    response.assertStatus(403)
    expect(user.password).toBeNull()
  })
})
