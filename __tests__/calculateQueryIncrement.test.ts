import { calculateQueryIncrement } from '../src/utils'
import { expect } from '@jest/globals'

describe('calculateQueryIncrement', () => {
  it('should return 0 if totalCount is equal to recordsInCollection', () => {
    const result = calculateQueryIncrement(100, 100, 50)
    expect(result).toBe(0)
  })

  it('should return the remaining records if they are less than maxIncrement', () => {
    const result = calculateQueryIncrement(90, 100, 50)
    expect(result).toBe(10)
  })

  it('should return maxIncrement if remaining records are more than maxIncrement', () => {
    const result = calculateQueryIncrement(50, 200, 50)
    expect(result).toBe(50)
  })

  it('should return 0 if totalCount is 0', () => {
    const result = calculateQueryIncrement(0, 0, 50)
    expect(result).toBe(0)
  })

  it('should return maxIncrement if recordsInCollection is 0 and totalCount is more than maxIncrement', () => {
    const result = calculateQueryIncrement(0, 100, 50)
    expect(result).toBe(50)
  })
})
