import { describe, it, expect } from 'vitest'
import {
  isValidUUID,
  validateEmail,
  validatePhoneNumber,
  formatDuration,
  calculateDurationMinutes,
  sanitizeInput,
  generateVisitorNumber,
  generateVisitReference,
} from '../utils'

describe('UUID Validation', () => {
  it('should validate correct UUIDs', () => {
    const validUUIDs = [
      '550e8400-e29b-41d4-a716-446655440000',
      '123e4567-e89b-12d3-a456-426614174000',
      'ffffffff-ffff-ffff-ffff-ffffffffffff',
      '00000000-0000-0000-0000-000000000000',
    ]
    validUUIDs.forEach((uuid) => {
      expect(isValidUUID(uuid)).toBe(true)
    })
  })

  it('should reject invalid UUIDs', () => {
    const invalidUUIDs = [
      'not-a-uuid',
      '550e8400-e29b-41d4-a716',
      '550e8400-e29b-41d4-a716-44665544000g',
      '550e8400-e29b-41d4-a716-4466554400',
      '',
      '123',
      'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    ]
    invalidUUIDs.forEach((uuid) => {
      expect(isValidUUID(uuid)).toBe(false)
    })
  })

  it('should be case-insensitive for UUIDs', () => {
    expect(isValidUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true)
    expect(isValidUUID('550e8400-E29B-41d4-A716-446655440000')).toBe(true)
  })
})

describe('Email Validation', () => {
  it('should validate correct emails', () => {
    const validEmails = [
      'test@example.com',
      'user.name@example.co.uk',
      'first+last@example.com',
    ]
    validEmails.forEach((email) => {
      expect(validateEmail(email)).toBe(true)
    })
  })

  it('should reject invalid emails', () => {
    const invalidEmails = [
      'test@',
      '@example.com',
      'test.example.com',
      'test @example.com',
    ]
    invalidEmails.forEach((email) => {
      expect(validateEmail(email)).toBe(false)
    })
  })
})

describe('Phone Number Validation', () => {
  it('should validate correct phone numbers', () => {
    const validPhones = [
      '1234567890',
      '+1-234-567-8900',
      '(123) 456-7890',
      '+1 (123) 456-7890',
    ]
    validPhones.forEach((phone) => {
      expect(validatePhoneNumber(phone)).toBe(true)
    })
  })

  it('should reject short phone numbers', () => {
    expect(validatePhoneNumber('123456789')).toBe(false)
  })
})

describe('Duration Formatting', () => {
  it('should format minutes correctly', () => {
    expect(formatDuration(45)).toBe('45m')
    expect(formatDuration(30)).toBe('30m')
  })

  it('should format hours correctly', () => {
    expect(formatDuration(60)).toBe('1h')
    expect(formatDuration(120)).toBe('2h')
  })

  it('should format hours and minutes correctly', () => {
    expect(formatDuration(90)).toBe('1h 30m')
    expect(formatDuration(125)).toBe('2h 5m')
  })
})

describe('Calculate Duration Minutes', () => {
  it('should calculate duration correctly', () => {
    const checkIn = new Date('2024-01-01T10:00:00')
    const checkOut = new Date('2024-01-01T10:45:00')
    expect(calculateDurationMinutes(checkIn, checkOut)).toBe(45)
  })

  it('should handle hours correctly', () => {
    const checkIn = new Date('2024-01-01T10:00:00')
    const checkOut = new Date('2024-01-01T12:00:00')
    expect(calculateDurationMinutes(checkIn, checkOut)).toBe(120)
  })
})

describe('Sanitize Input', () => {
  it('should remove < and > characters', () => {
    const result1 = sanitizeInput('<script>alert("xss")</script>')
    const result2 = sanitizeInput('<b>bold</b>')
    expect(result1).toBe('scriptalert("xss")/script')
    expect(result2).toBe('bbold/b')
  })

  it('should trim whitespace', () => {
    expect(sanitizeInput('  test  ')).toBe('test')
  })

  it('should truncate to 255 characters', () => {
    const longString = 'a'.repeat(300)
    expect(sanitizeInput(longString).length).toBe(255)
  })
})

describe('Generate Visitor Number', () => {
  it('should generate visitor number with correct format', () => {
    const visitorNumber = generateVisitorNumber()
    expect(visitorNumber).toMatch(/^VIS-\d{6}-\d{3}$/)
  })

  it('should generate unique visitor numbers', () => {
    const numbers = new Set()
    for (let i = 0; i < 100; i++) {
      numbers.add(generateVisitorNumber())
    }
    // Should have mostly unique numbers (allowing for small collisions due to randomness)
    expect(numbers.size).toBeGreaterThan(90)
  })
})

describe('Generate Visit Reference', () => {
  it('should generate visit reference with correct format', () => {
    const visitReference = generateVisitReference()
    expect(visitReference).toMatch(/^VISIT-\d{8}-\d{6}-\d{4}$/)
  })
})
