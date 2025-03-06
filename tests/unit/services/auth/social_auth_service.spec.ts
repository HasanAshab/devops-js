import { test } from '@japa/runner'
import { refreshDatabase } from '#tests/helpers'
import User from '#models/user'
import app from '@adonisjs/core/services/app'
import { SocialAuthData } from '#interfaces/auth'
import SocialAuthService from '#services/auth/social_auth_service'
import UsernameGenerator from '#services/user/username_generator'
import EmailRequiredException from '#exceptions/validation/email_required_exception'
import UsernameRequiredException from '#exceptions/validation/username_required_exception'
import DuplicateEmailAndUsernameException from '#exceptions/validation/duplicate_email_and_username_exception'
import DuplicateUsernameException from '#exceptions/validation/duplicate_username_exception'
import DuplicateEmailException from '#exceptions/validation/duplicate_email_exception'

/*
Run this suits:
node ace test unit --files="services/auth/social_auth_service.spec.ts"
*/
test.group('Services / Auth / Social Auth Service', (group) => {
  let service: SocialAuthService

  group.setup(async () => {
    service = await app.container.make(SocialAuthService)
  })

  refreshDatabase(group)

  //Create
  test('should create a new user', async ({ expect }) => {
    const data: Partial<SocialAuthData> = {
      id: '1',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      email: 'test@example.com',
      emailVerificationState: 'verified',
    }

    const result = await service.sync('google', data as SocialAuthData)
    expect(result.user.email).toBe(data.email)
    expect(result.user.username).toBe('test')
    expect(result.user.verified).toBeTrue()
    expect(result.user.socialAvatarUrl).toBe(data.avatarUrl)
    expect(result.isRegisteredNow).toBeTrue()
  })

  test(
    'should create user with verification status "{status}" when email verification state is {state}'
  )
    .with([
      { state: 'verified', status: true } as const,
      { state: 'unverified', status: false } as const,
      { state: 'unsupported', status: false } as const,
    ])
    .run(async ({ expect }, { state, status }) => {
      const data: Partial<SocialAuthData> = {
        id: '1',
        name: 'Test User',
        avatarUrl: 'http://example.com/avatar.jpg',
        email: 'test@example.com',
        emailVerificationState: state,
      }

      const result = await service.sync('google', data as SocialAuthData)

      expect(result.user.verified).toBe(status)
    })

  test('should generate username from email', async ({ expect }) => {
    const data: Partial<SocialAuthData> = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      emailVerificationState: 'verified',
    }

    const result = await service.sync('google', data as SocialAuthData)

    expect(result.user.username).toBe('test')
  })

  //Update
  test('should update name and avatar', async ({ expect }) => {
    const socialProvider = 'google'

    const data = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      emailVerificationState: 'verified',
    } satisfies Partial<SocialAuthData>

    await User.create({
      socialId: data.id,
      socialProvider,
      email: data.email,
      username: 'test',
      name: 'Old Name',
      socialAvatarUrl: 'http://example.com/old-avatar.jpg',
    })

    const result = await service.sync(socialProvider, data as SocialAuthData)

    expect(result.user.name).toBe(data.name)
    expect(result.user.socialAvatarUrl).toBe(data.avatarUrl)
  })

  test('should not update email', async ({ expect }) => {
    const socialProvider = 'google'

    const data: Partial<SocialAuthData> = {
      id: '1',
      email: 'test.new@example.com',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      emailVerificationState: 'verified',
    }

    const user = await User.create({
      socialId: data.id,
      socialProvider,
      email: 'test@example.com',
      username: 'test',
    })

    const result = await service.sync(socialProvider, data as SocialAuthData)

    expect(result.user.email).toBe(user.email)
  })

  test('should not update username', async ({ expect }) => {
    const socialProvider = 'google'
    const data: Partial<SocialAuthData> = {
      id: '1',
      email: 'test.new@example.com',
      name: 'Test User',
      username: 'test12',
      avatarUrl: 'http://example.com/avatar.jpg',
      emailVerificationState: 'verified',
    }

    const user = await User.create({
      socialId: data.id,
      socialProvider,
      email: 'test@example.com',
      username: 'test',
    })

    const result = await service.sync(socialProvider, data as SocialAuthData)

    expect(result.user.username).toBe(user.username)
  })

  test('should not update username based on the new email provided by oauth', async ({
    expect,
  }) => {
    const socialProvider = 'google'
    const data: Partial<SocialAuthData> = {
      id: '1',
      email: 'test.new@example.com',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      emailVerificationState: 'verified',
    }

    const user = await User.create({
      socialId: data.id,
      socialProvider,
      email: 'test@example.com',
      username: 'test',
    })

    const result = await service.sync(socialProvider, data as SocialAuthData)

    expect(result.user.username).toBe(user.username)
  })

  test(
    'should update user verification status to {status} when oauth provided email is same and email verification state is {state}'
  )
    .with([
      { state: 'verified', status: true } as const,
      { state: 'unverified', status: false } as const,
      { state: 'unsupported', status: false } as const,
    ])
    .run(async ({ expect }, { state, status }) => {
      const socialProvider = 'google'

      const data: Partial<SocialAuthData> = {
        id: '1',
        email: 'test.new@example.com',
        name: 'Test User',
        avatarUrl: 'http://example.com/avatar.jpg',
        emailVerificationState: state,
      }

      await User.create({
        socialId: data.id,
        socialProvider,
        email: 'test@example.com',
        username: 'test',
        verified: status,
      })

      const result = await service.sync(socialProvider, data as SocialAuthData)

      expect(result.user.verified).toBe(status)
    })

  test(
    'should not update user verification status from {status} when social email not match and email verification state is {state}'
  )
    .with([
      { state: 'verified', status: false } as const,
      { state: 'verified', status: true } as const,
      { state: 'unverified', status: false } as const,
      { state: 'unverified', status: true } as const,
      { state: 'unsupported', status: false } as const,
      { state: 'unsupported', status: true } as const,
    ])
    .run(async ({ expect }, { state, status }) => {
      const socialProvider = 'google'

      const data: Partial<SocialAuthData> = {
        id: '1',
        email: 'test.new@example.com',
        name: 'Test User',
        avatarUrl: 'http://example.com/avatar.jpg',
        emailVerificationState: state,
      }

      await User.create({
        socialId: data.id,
        socialProvider,
        email: 'test@example.com',
        username: 'test',
        verified: status,
      })

      const result = await service.sync(socialProvider, data as SocialAuthData)

      expect(result.user.verified).toBe(status)
    })

  // Registered Flag
  test('should flag registered when email provided by oauth and unique username genrated successfully', async ({
    expect,
  }) => {
    const data: Partial<SocialAuthData> = {
      id: '1',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      email: 'test@example.com',
      emailVerificationState: 'verified',
    }

    const result = await service.sync('google', data as SocialAuthData)

    expect(result.isRegisteredNow).toBeTrue()
  })

  test('should flag registered for first time only', async ({ expect }) => {
    const data: Partial<SocialAuthData> = {
      id: '1',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      email: 'test@example.com',
      emailVerificationState: 'verified',
    }

    const result1 = await service.sync('google', data as SocialAuthData)
    const result2 = await service.sync('google', data as SocialAuthData)

    expect(result1.isRegisteredNow).toBeTrue()
    expect(result2.isRegisteredNow).toBeFalse()
  })

  //Validation Exception
  test('should throw validation exception when email not provided by the oauth', async ({
    expect,
  }) => {
    const data: Partial<SocialAuthData> = {
      id: '1',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      emailVerificationState: 'unsupported',
    }
    const result = service.sync('google', data as SocialAuthData)

    await expect(result).rejects.toThrow(EmailRequiredException)
  })

  test('should throw validation exception if email is not unique', async ({ expect }) => {
    const email = 'test@example.com'
    const data: Partial<SocialAuthData> = {
      id: '1',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      email,
      emailVerificationState: 'verified',
    }

    await User.create({ email })
    const result = service.sync('google', data as SocialAuthData)

    await expect(result).rejects.toThrow(DuplicateEmailException)
  })

  test('should throw validation exception if user have a email and username not provided', async ({
    expect,
  }) => {
    const socialProvider = 'google'
    const data = {
      id: '1',
      name: 'Test User',
    } satisfies Partial<SocialAuthData>

    await User.create({
      email: 'test@gmail.com',
      socialId: data.id,
      socialProvider,
    })

    const result = service.sync(socialProvider, data as SocialAuthData)

    await expect(result).rejects.toThrow(UsernameRequiredException)
  })

  test('should throw validation exception if failed to generate unique username', async ({
    expect,
  }) => {
    class MockedUsernameGenerator extends UsernameGenerator {
      async makeUnique() {
        return null
      }
    }
    app.container.swap(UsernameGenerator, () => new MockedUsernameGenerator())

    service = await app.container.make(SocialAuthService)

    const data: Partial<SocialAuthData> = {
      id: '1',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      email: 'test@example.com',
      emailVerificationState: 'verified',
    }

    const result = service.sync('google', data as SocialAuthData)

    await expect(result).rejects.toThrow(UsernameRequiredException)
  })

  test('should throw validation exception if username is not unique', async ({ expect }) => {
    const data: Partial<SocialAuthData> = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      emailVerificationState: 'verified',
      username: 'test',
    }

    await User.create({
      username: data.username,
    })
    const result = service.sync('google', data as SocialAuthData)

    await expect(result).rejects.toThrow(DuplicateUsernameException)
  })

  test('should throw validation exception if email and username is not unique', async ({
    expect,
  }) => {
    const data = {
      id: '1',
      name: 'Test User',
      avatarUrl: 'http://example.com/avatar.jpg',
      email: 'test@example.com',
      emailVerificationState: 'verified',
      username: 'test',
    } satisfies Partial<SocialAuthData>

    await User.create({
      email: data.email,
      username: data.username,
    })

    const result = service.sync('google', data as SocialAuthData)

    await expect(result).rejects.toThrow(DuplicateEmailAndUsernameException)
  })
})
