import gql from 'graphql-tag'

/**
 * GraphQL query to fetch the current rate limit information.
 *
 * This query retrieves the following rate limit details:
 * - `limit`: The maximum number of requests that can be made in the current rate limit window.
 * - `cost`: The cost of the current query in terms of rate limit points.
 * - `remaining`: The number of requests remaining in the current rate limit window.
 * - `resetAt`: The time at which the current rate limit window resets.
 */
export const getRateLimit = gql`
  query {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
  }
`

export default getRateLimit
