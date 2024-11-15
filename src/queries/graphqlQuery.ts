import * as core from '@actions/core'
import { NormalizedCacheObject } from 'apollo-cache-inmemory'
import ApolloClient, { ApolloError, ApolloQueryResult } from 'apollo-client'
import { DocumentNode } from 'apollo-link'

import { processRateLimit } from '../utils/'

/**
 * Executes a GraphQL query using the provided Apollo client
 *
 * @template T - The expected shape of the response data.
 * @param {Object} params - The parameters for the query.
 * @param {ApolloClient<NormalizedCacheObject>} params.client - The Apollo client instance to use for the query.
 * @param {DocumentNode} params.query - The GraphQL query to execute.
 * @param {any} params.variables - The variables to pass to the GraphQL query.
 * @param {RateLimit} [params.rateLimit] - The rate limit information, including limit, cost, remaining tokens, and reset time.
 * @returns {Promise<T>} - A promise that resolves to the query response data.
 */
export const graphqlQuery = async <T>({
  client,
  query,
  variables,
  rateLimit = {
    limit: 5000,
    cost: 1,
    remaining: 5000,
    resetAt: null
  }
}: {
  client: ApolloClient<NormalizedCacheObject>
  query: DocumentNode
  variables: any // eslint-disable-line
  rateLimit?: RateLimit
}): Promise<T> => {
  // If the remaining tokens are less than 50, wait until the token reset
  await processRateLimit(rateLimit)

  let data: T | undefined

  // eslint-disable-next-line
  data = await client
    .query({
      query,
      variables, // eslint-disable-line
      fetchPolicy: 'no-cache',
      errorPolicy: 'ignore'
    })
    .then((response: ApolloQueryResult<BaseQueryResponse>) => {
      if (
        response.data !== undefined &&
        response.data.rateLimit !== undefined
      ) {
        core.info(
          'GitHub Tokens - remaining: ' +
            response.data.rateLimit.remaining +
            ' query cost: ' +
            response.data.rateLimit.cost +
            ' (token will reset at: ' +
            response.data.rateLimit.resetAt +
            ')'
        )
      }
      return response.data as T
    })
    .catch((error: ApolloError): T | undefined => {
      core.warning('Unable to perform the GraphQL Query')
      core.warning('Error Message: ' + JSON.stringify(error.message))
      core.debug(`GraphQL Query: ${JSON.stringify(query)}`)
      core.debug(`GraphQL Variables: ${JSON.stringify(variables)}`)
      core.debug(`Response data: ${JSON.stringify(data)}`)
      core.debug(`Full error response: ${JSON.stringify(error)}`)
      return undefined
    })

  if (data === undefined || data === null) {
    return {} as T
  }

  return data as T
}
export default graphqlQuery
