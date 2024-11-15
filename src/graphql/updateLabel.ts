import gql from 'graphql-tag'

export const updateLabel = gql`
  mutation (
    $labelId: ID!
    $name: String!
    $color: String!
    $description: String
  ) {
    updateLabel(
      input: {
        id: $labelId
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

export default updateLabel
