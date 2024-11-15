import * as core from '@actions/core'
import { processRateLimit, sleep } from '../src/utils'

jest.mock('@actions/core')
jest.mock('../src/utils/sleep')

describe('processRateLimit', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not pause execution if remaining tokens are above the threshold', async () => {
    const rateLimit = {
      remaining: 100,
      cost: 10,
      limit: 1000,
      resetAt: new Date(Date.now() + 60000).toISOString()
    }

    await processRateLimit(rateLimit, 50)

    expect(core.info).not.toHaveBeenCalled()
    expect(sleep).not.toHaveBeenCalled()
  })

  it('should pause execution if remaining tokens are below the threshold and resetAt is in the future', async () => {
    const rateLimit = {
      remaining: 40,
      cost: 10,
      limit: 1000,
      resetAt: new Date(Date.now() + 60000).toISOString()
    }

    await processRateLimit(rateLimit, 50)

    expect(core.info).toHaveBeenCalledWith(
      expect.stringContaining('Less than 50 remaining')
    )
    expect(sleep).toHaveBeenCalledWith(expect.any(Number))
    expect(core.info).toHaveBeenCalledWith('Ready to resume querying')
  })
})
