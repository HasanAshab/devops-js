import { expect } from 'expect'

export default abstract class Assertor {
  abstract fake(...args: any[]): any

  protected assertTrue(result: boolean, steps?: number) {
    try {
      expect(result).toBeTrue()
    } catch (err) {
      throw this.resolveTestContext(err, steps)
    }
  }
  protected assertFalse(result: boolean, steps?: number) {
    try {
      expect(result).toBeFalse()
    } catch (err) {
      throw this.resolveTestContext(err, steps)
    }
  }

  private resolveTestContext(err: Error, steps = 2) {
    err.stack = err.stack!.split('\n').toSpliced(4, steps).join('\n')
    return err
  }
}
