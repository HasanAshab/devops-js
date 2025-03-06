import type { HttpContext } from '@adonisjs/core/http'
import { bind } from '@adonisjs/route-model-binding'
import NotificationType from '#models/notification_type'
import {
  createNotificationTypeValidator,
  updateNotificationTypeValidator,
} from '#validators/v1/notification_type_validator'
import NotificationTypeCollection from '#resources/v1/notification_type/notification_type_collection'

export default class NotificationTypesController {
  async index() {
    return NotificationTypeCollection.make(await NotificationType.all())
  }

  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(createNotificationTypeValidator)
    return response.created(await NotificationType.create(data))
  }

  @bind()
  show({ params }: HttpContext, notificationType: NotificationType) {
    return notificationType
  }

  async update({ request, params }: HttpContext) {
    const data = await request.validateUsing(updateNotificationTypeValidator)
    await NotificationType.updateOrFail(params.id, data)

    return 'Notification type updated!'
  }

  async delete({ response, params }: HttpContext) {
    await NotificationType.deleteOrFail(params.id)
    response.noContent()
  }
}
