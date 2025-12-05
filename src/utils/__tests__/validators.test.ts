import { describe, expect, it } from 'vitest'
import { isStrongPassword, isValidEmail } from '../validators'

describe('validators', () => {
  it('should validate email format', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
    expect(isValidEmail('invalid-email')).toBe(false)
  })

  it('should validate strong password', () => {
    expect(isStrongPassword('Password1')).toBe(true)
    expect(isStrongPassword('short1')).toBe(false)
    expect(isStrongPassword('onlyletters')).toBe(false)
    expect(isStrongPassword('12345678')).toBe(false)
  })
})



