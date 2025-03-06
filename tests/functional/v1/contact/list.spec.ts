import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import Contact from '#models/contact'
import { UserFactory } from '#factories/user_factory'
import { ContactFactory } from '#factories/contact_factory'
import { extract } from '#app/helpers'
import ListContactResource from '#resources/v1/contact/list_contact_resource'
import ShowContactResource from '#resources/v1/contact/show_contact_resource'

/*
Run this suits:
node ace test functional --files="v1/contact/list.spec.ts"
*/
test.group('Contact / List', (group) => {
  let admin: User

  refreshDatabase(group)

  group.each.setup(async () => {
    admin = await UserFactory.apply('admin').create()
  })

  test('Should list contacts', async ({ client }) => {
    const contacts = await ContactFactory.createMany(2)

    const response = await client.get('/api/v1/contact/inquiries').loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains(ListContactResource.collection(contacts))
  })

  test('Users should not get contacts list', async ({ client }) => {
    const user = await UserFactory.create()
    const contacts = await ContactFactory.createMany(2)

    const response = await client.get('/api/v1/contact/inquiries').loginAs(user)

    response.assertStatus(403)
    response.assertBodyNotHaveProperty('data')
  })

  test('Should get contact', async ({ client }) => {
    const contact = await ContactFactory.create()

    const response = await client.get('/api/v1/contact/inquiries/' + contact.id).loginAs(admin)

    response.assertStatus(200)
    response.assertBodyContains(ShowContactResource.make(contact))
  })

  test('Users should not get contact', async ({ client }) => {
    const user = await UserFactory.create()
    const contact = await ContactFactory.create()

    const response = await client.get('/api/v1/contact/inquiries/' + contact.id).loginAs(user)

    response.assertStatus(403)
    response.assertBodyNotHaveProperty('data')
  })
  
  test('Should search contacts', async ({ client }) => {
    const message = 'I discovered a bug in your website'
    const admin = await UserFactory.apply('admin').create()
    const contact = await ContactFactory.merge({ message }).create()

    const response = await client.get('/api/v1/contact/inquiries').loginAs(admin).qs({
      q: 'website bug',
    })

    response.assertStatus(200)
    response.assertBodyContains(ListContactResource.collection([contact]))
    response.assertBodyHaveProperty('data[0].id', contact.id)
  })

  test('Users should not search contacts', async ({ client }) => {
    const message = 'I discovered a bug in your website'
    const user = await UserFactory.create()
    const contact = await ContactFactory.merge({ message }).create()

    const response = await client.get('/api/v1/contact/inquiries').loginAs(user).qs({
      q: 'website bug',
    })

    response.assertStatus(403)
    response.assertBodyNotHaveProperty('data')
  })

  test('Should filter contacts', async ({ client }) => {
    const admin = await UserFactory.apply('admin').create()
    const openedContact = await ContactFactory.create()
    await ContactFactory.apply('closed').create()

    const response = await client.get('/api/v1/contact/inquiries').loginAs(admin).qs({
      status: 'opened',
    })

    response.assertStatus(200)
    response.assertBodyHaveProperty('data[0].id', openedContact.id)
  })
})
