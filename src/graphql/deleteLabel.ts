import gql from 'graphql-tag'

export const deleteLabel = gql`
  mutation ($labelId: ID!) {
    deleteLabel(input: { id: $labelId }) {
      clientMutationId
    }
  }
`

export default deleteLabel
