import gql from 'graphql-tag'

export const labelFragment = gql`
  fragment labelFragment on Label {
    id
    url
    color
    name
    description
    isDefault
    createdAt
    updatedAt
    issues(first: 1) {
      totalCount
    }
    pullRequests(first: 1) {
      totalCount
    }
    repository {
      id
      name
      url
      databaseId
      isArchived
      isDisabled
      owner {
        id
        login
        url
      }
    }
  }
`

export default labelFragment
