import { expect } from '@jest/globals'
import { format } from 'date-fns'

import { timeSinceStart, formatDate } from '../src/utils'

describe('timeSinceStart', () => {
  it('should return 00:00:00 for the same start and current date', () => {
    const startDate = new Date()
    const result = timeSinceStart(startDate)
    expect(result).toBe('[+00:00:00]')
  })

  it('started 30s ago', () => {
    const startDate = new Date(new Date().getTime() - 30 * 1000) // 30 seconds ago
    const result = timeSinceStart(startDate)
    expect(result).toBe('[+00:00:30]')
  })

  it('started 5mn ago', () => {
    const startDate = new Date(new Date().getTime() - 5 * 60 * 1000) // 5 minutes ago
    const result = timeSinceStart(startDate)
    expect(result).toBe('[+00:05:00]')
  })

  it('started 2 hours ago', () => {
    const startDate = new Date(new Date().getTime() - 2 * 3600 * 1000) // 2 hours ago
    const result = timeSinceStart(startDate)
    expect(result).toBe('[+02:00:00]')
  })
})

describe('formatDate', () => {
  it('should format a specific date correctly', () => {
    const date = new Date('2023-01-01T00:00:00Z')
    const result = formatDate(date)
    expect(result).toBe(format(date, 'PPPP pppp'))
  })
})
