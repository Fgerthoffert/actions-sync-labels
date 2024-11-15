import * as core from '@actions/core'

import { sleep } from './sleep'

/**
 * Processes the rate limit and pauses execution if the remaining tokens are below a specified threshold.
 *
 * @param rateLimit - The current rate limit information.
 * @param minTokens - The minimum number of tokens that should remain before pausing execution. Defaults to 50.
 * @returns A promise that resolves when the execution can resume.
 */
export const processRateLimit = async (
  rateLimit: RateLimit,
  minTokens = 50
): Promise<void> => {
  if (rateLimit.remaining - rateLimit.cost < 50 && rateLimit.resetAt !== null) {
    const sleepDuration =
      (new Date(rateLimit.resetAt).getTime() - new Date().getTime()) / 1000
    core.info(
      `Less than ${minTokens} remaining, will resuming querying after ${rateLimit.resetAt} (in ${sleepDuration}s)`
    )
    // Wait for 5s after sleepDuration to ensure the rate limit has been reset
    await sleep((sleepDuration + 5) * 1000)
    core.info('Ready to resume querying')
  }
}
