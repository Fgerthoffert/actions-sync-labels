import gql from 'graphql-tag'

import { labelFragment } from './labelFragment'

export const getLabels = gql`
  query ($repoId: ID!, $cursor: String, $increment: Int) {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    node(id: $repoId) {
      ... on Repository {
        ghNode: labels(first: $increment, after: $cursor) {
          totalCount
          edges {
            cursor
            node {
              ...labelFragment
            }
          }
        }
      }
    }
  }
  ${labelFragment}
`

export default getLabels
