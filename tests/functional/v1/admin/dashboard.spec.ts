import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import { UserFactory } from '#factories/user_factory'

/*
Run this suits:
node ace test functional --files="v1/admin/dashboard.spec.ts"
*/
test.group('Admin / Dashboard', (group) => {
  refreshDatabase(group)

  test("Users shouldn't get admin dashboard", async ({ client, expect }) => {
    const user = await UserFactory.create()

    const response = await client.get('/api/v1/admin/dashboard').loginAs(user)

    response.assertStatus(403)
    response.assertBodyNotHaveProperty('data')
  })

  test('Admin should get dashboard', async ({ client, expect }) => {
    const admin = await UserFactory.apply('admin').create()
    const todayUsers = await UserFactory.createMany(2)
    const oldUsers = await UserFactory.apply('registeredPreviousWeek').createMany(3)

    const response = await client.get('/api/v1/admin/dashboard').loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains({
      data: {
        totalUsers: todayUsers.length + oldUsers.length,
        newUsersToday: todayUsers.length,
      },
    })
  })
})
