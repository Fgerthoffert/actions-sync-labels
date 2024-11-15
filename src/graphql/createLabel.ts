import gql from 'graphql-tag'

export const createLabel = gql`
  mutation (
    $repositoryId: ID!
    $name: String!
    $color: String!
    $description: String
  ) {
    createLabel(
      input: {
        repositoryId: $repositoryId
        name: $name
        color: $color
        description: $description
      }
    ) {
      label {
        id
      }
    }
  }
`

export default createLabel
