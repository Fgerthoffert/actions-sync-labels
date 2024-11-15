import gql from 'graphql-tag'

/**
 * GraphQL query to fetch repositories of a given organization.
 *
 * @param {ID!} orgId - The ID of the organization.
 * @param {String} [cursor] - The cursor for pagination.
 * @param {Int} [increment] - The number of repositories to fetch per request.
 *
 * @returns {Object} - The query result containing rate limit information and repositories data.
 *
 * The query retrieves the following information:
 * - Rate limit details (limit, cost, remaining, reset time)
 * - Repositories of the organization including:
 *   - Repository name, ID, URL, and archival status
 *   - Repository topics (up to 10) with their IDs, names, and URLs
 *   - Repository owner details (ID, login, URL)
 */
export const getOrgRepos = gql`
  query ($orgId: ID!, $cursor: String, $increment: Int) {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    node(id: $orgId) {
      ... on Organization {
        ghNode: repositories(first: $increment, after: $cursor) {
          totalCount
          edges {
            cursor
            node {
              name
              id
              url
              isArchived
              repositoryTopics(first: 10) {
                totalCount
                edges {
                  node {
                    id
                    topic {
                      id
                      name
                    }
                    url
                  }
                }
              }
              owner {
                id
                login
                url
              }
            }
          }
        }
      }
    }
  }
`

export default getOrgRepos
