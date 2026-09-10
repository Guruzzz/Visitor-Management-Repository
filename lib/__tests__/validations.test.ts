import { describe, it, expect } from 'vitest'
import {
  visitorRegistrationSchema,
  visitRegistrationSchema,
  searchSchema,
} from '../validations'

describe('Validations', () => {
  describe('visitorRegistrationSchema', () => {
    it('should validate correct visitor data', () => {
      const validData = {
        full_name: 'John Doe',
        phone: '+1 (555) 000-0000',
        national_id: 'ABC123456',
        company: 'Acme Corp',
      }
      expect(() => visitorRegistrationSchema.parse(validData)).not.toThrow()
    })

    it('should reject short name', () => {
      const invalidData = {
        full_name: 'J',
        phone: '+1 (555) 000-0000',
        national_id: 'ABC123456',
        company: 'Acme Corp',
      }
      expect(() => visitorRegistrationSchema.parse(invalidData)).toThrow()
    })

    it('should reject short phone', () => {
      const invalidData = {
        full_name: 'John Doe',
        phone: '123',
        national_id: 'ABC123456',
        company: 'Acme Corp',
      }
      expect(() => visitorRegistrationSchema.parse(invalidData)).toThrow()
    })

    it('should reject invalid phone format', () => {
      const invalidData = {
        full_name: 'John Doe',
        phone: 'invalid-phone',
        national_id: 'ABC123456',
        company: 'Acme Corp',
      }
      expect(() => visitorRegistrationSchema.parse(invalidData)).toThrow()
    })
  })

  describe('visitRegistrationSchema', () => {
    it('should validate correct visit data', () => {
      const validData = {
        person_being_visited: 'Jane Manager',
        department: 'Sales',
        purpose: 'Client meeting and presentation',
      }
      expect(() => visitRegistrationSchema.parse(validData)).not.toThrow()
    })

    it('should reject short purpose', () => {
      const invalidData = {
        person_being_visited: 'Jane Manager',
        department: 'Sales',
        purpose: 'hi',
      }
      expect(() => visitRegistrationSchema.parse(invalidData)).toThrow()
    })

    it('should reject empty department', () => {
      const invalidData = {
        person_being_visited: 'Jane Manager',
        department: '',
        purpose: 'Client meeting and presentation',
      }
      expect(() => visitRegistrationSchema.parse(invalidData)).toThrow()
    })
  })

  describe('searchSchema', () => {
    it('should validate correct search query', () => {
      const validData = {
        query: 'John Doe',
        searchType: 'name' as const,
      }
      expect(() => searchSchema.parse(validData)).not.toThrow()
    })

    it('should accept all search types', () => {
      const searchTypes = ['name', 'phone', 'id', 'company', 'visitor_id'] as const
      searchTypes.forEach((type) => {
        const data = {
          query: 'test',
          searchType: type,
        }
        expect(() => searchSchema.parse(data)).not.toThrow()
      })
    })

    it('should reject invalid search type', () => {
      const invalidData = {
        query: 'test',
        searchType: 'invalid',
      }
      expect(() => searchSchema.parse(invalidData as any)).toThrow()
    })
  })
})
