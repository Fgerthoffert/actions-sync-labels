import gql from 'graphql-tag'

/**
 * GraphQL query to fetch a limited amount of organization details by its name.
 *
 * @param {String} orgName - The name of the organization to fetch details for.
 * @returns {Object} - The organization details including id, login, and url.
 * Also returns rate limit information including limit, cost, remaining, and reset time.
 */
export const getOrgByName = gql`
  query ($orgName: String!) {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    organization(login: $orgName) {
      id
      login
      url
    }
  }
`

export default getOrgByName
