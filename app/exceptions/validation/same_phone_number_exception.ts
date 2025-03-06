import ValidationException from '#exceptions/validation/validation_exception'

export default class SamePhoneNumberException extends ValidationException {
  fieldsWithRule = {
    phoneNumber: 'Phone number should not be same as old one!',
  }
}
