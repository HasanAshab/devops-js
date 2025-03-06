import { ApiRequest } from '@japa/api-client'
import LoggedDevice from '#models/logged_device'

ApiRequest.macro('deviceId', function (this: ApiRequest, deviceId: string) {
  return this.header('X-DEVICE-ID', deviceId)
})

ApiRequest.macro('usingDevice', function (this: ApiRequest, device: LoggedDevice) {
  return this.deviceId(device.id)
})
