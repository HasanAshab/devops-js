import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import type User from '#models/user'
import { UserFactory } from '#factories/user_factory'
import mail from '@adonisjs/mail/services/main'
import EmailVerificationMail from '#mails/email_verification_mail'

/*
Run this suits:
node ace test functional --files="v1/auth/verification.spec.ts"
*/
test.group('Auth / Verification', (group) => {
  let user: User

  refreshDatabase(group)

  group.each.setup(async () => {
    user = await UserFactory.apply('unverified').create()
  })

  test('should verify email', async ({ client, expect }) => {
    const token = await new EmailVerificationMail(user, 'v1').verificationToken()

    const response = await client.post('api/v1/auth/verification').json({
      id: user.id,
      token,
    })
    await user.refresh()

    response.assertStatus(200)
    expect(user.verified).toBeTrue()
  })

  test("shouldn't verify email without token", async ({ client, expect }) => {
    const response = await client.post('api/v1/auth/verification').json({
      id: user.id,
    })
    await user.refresh()

    response.assertStatus(422)
    expect(user.verified).toBeFalse()
  })

  test('should resend verification email', async ({ client }) => {
    const { mails } = mail.fake()

    const response = await client.post('/api/v1/auth/verification/notification').json({
      email: user.email,
    })

    response.assertStatus(202)
    mails.assertQueued(EmailVerificationMail, ({ message }) => {
      return message.hasTo(user.email)
    })
  })

  test("shouldn't resend verification email when no user found", async ({ client }) => {
    const { mails } = mail.fake()
    const email = 'test@gmail.com'

    const response = await client.post('/api/v1/auth/verification/notification').json({ email })

    response.assertStatus(202)
    mails.assertNoneQueued()
  })
})
