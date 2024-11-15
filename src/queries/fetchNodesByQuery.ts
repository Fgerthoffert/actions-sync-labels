import * as core from '@actions/core'
import { DocumentNode } from 'apollo-link/lib/types'
import ApolloClient from 'apollo-client'
import { NormalizedCacheObject } from 'apollo-cache-inmemory'

import { sleep, calculateQueryIncrement } from '../utils'
import { graphqlQuery } from './'

/**
 * Fetches nodes from a GitHub GraphQL API with pagination support.
 *
 * To the difference of fetchNodesByIds, this function does not know the total number of records to fetch and uses cursor-based pagination to fetch all records.
 *
 * @template T - The type of the nodes being fetched.
 *
 * @param {Object} params - The parameters for the function.
 * @param {ApolloClient<NormalizedCacheObject>} params.ghClient - The Apollo GraphQL client.
 * @param {string | null} params.cursor - The cursor for pagination.
 * @param {number} params.increment - The number of nodes to fetch per request.
 * @param {DocumentNode} params.graphQLQuery - The GraphQL query document.
 * @param {any} params.queryParams - The parameters for the GraphQL query.
 * @param {RateLimit} params.rateLimit - The rate limit information.
 * @param {number} params.errorRetry - The current retry count for errors.
 * @param {GitHubNode[]} params.fetchedNodes - The array to store fetched nodes.
 *
 * @returns {Promise<T>} - A promise that resolves to the fetched nodes.
 *
 * @throws {Error} - Throws an error if too many errors occur during the fetching process.
 */
const getNodesPagination = async <T>({
  ghClient,
  cursor,
  increment,
  graphQLQuery,
  queryParams,
  rateLimit,
  errorRetry,
  fetchedNodes
}: {
  ghClient: ApolloClient<NormalizedCacheObject>
  cursor: string | null
  increment: number
  graphQLQuery: DocumentNode
  queryParams: any // eslint-disable-line
  rateLimit: RateLimit
  errorRetry: number
  fetchedNodes: GitHubNode[]
}): Promise<T> => {
  if (errorRetry <= 3) {
    // Wait 1s between requests to avoid hitting GitHub API rate limit => https://developer.github.com/v3/guides/best-practices-for-integrators/
    await sleep(1000)

    // Time call duration to display the number of nodes fetched per second
    const t0 = performance.now()

    const data: BaseQueryResponse = await graphqlQuery<BaseQueryResponse>({
      client: ghClient,
      query: graphQLQuery,
      // eslint-disable-next-line
      variables: {
        ...queryParams,
        // eslint-disable-next-line
        cursor,
        increment
      },
      rateLimit: rateLimit
    })

    const t1 = performance.now()
    const callDuration = t1 - t0

    if (data !== undefined && data !== null) {
      errorRetry = 0
      if (data.rateLimit !== undefined) {
        rateLimit = data.rateLimit
      }

      const ghData = data.viewer !== undefined ? data.viewer : data.node
      // ghData can be null if the repository has been deleted or access has been lost
      // In that case, there's no point in continuing to fetch.
      if (ghData !== undefined && ghData !== null) {
        let lastCursor = null
        if (ghData.ghNode.edges.length > 0) {
          const apiPerf = Math.round(
            ghData.ghNode.edges.length / (callDuration / 1000)
          )
          core.info(
            `Latest call contained ${ghData.ghNode.edges.length} nodes, download rate: ${apiPerf} nodes/s`
          )
        }
        for (const currentNode of ghData.ghNode.edges) {
          fetchedNodes.push(currentNode.node)
          lastCursor = currentNode.cursor
        }

        const queryIncrement = calculateQueryIncrement(
          fetchedNodes.length,
          ghData.ghNode.totalCount,
          increment
        )
        core.info(
          'Params: ' +
            JSON.stringify(queryParams) +
            ' -> Fetched Count / Remote Count / Query Increment: ' +
            fetchedNodes.length +
            ' / ' +
            ghData.ghNode.totalCount +
            ' / ' +
            queryIncrement
        )
        if (queryIncrement > 0 && lastCursor !== null) {
          fetchedNodes = await getNodesPagination({
            ghClient: ghClient,
            cursor: lastCursor,
            increment: queryIncrement,
            graphQLQuery: graphQLQuery,
            // eslint-disable-next-line
            queryParams: queryParams,
            rateLimit: rateLimit,
            errorRetry: 0,
            fetchedNodes: fetchedNodes
          })
        }
      }
    } else {
      errorRetry = errorRetry + 1
      core.error('Error loading content, current count: ' + errorRetry)
      fetchedNodes = await getNodesPagination({
        ghClient: ghClient,
        cursor: cursor,
        increment: increment,
        graphQLQuery: graphQLQuery,
        // eslint-disable-next-line
        queryParams: queryParams,
        rateLimit: rateLimit,
        errorRetry: 0,
        fetchedNodes: fetchedNodes
      })
    }
  } else {
    throw new Error(
      `Too many errors when trying to load data from GitHin, stopping the import process`
    )
  }
  return fetchedNodes as T
}

export const fetchNodesByQuery = async <T>({
  ghClient,
  graphQLQuery,
  queryParams,
  maxNodes,
  rateLimit = {
    limit: 5000,
    cost: 1,
    remaining: 5000,
    resetAt: null
  }
}: {
  ghClient: ApolloClient<NormalizedCacheObject>
  graphQLQuery: DocumentNode
  queryParams: any // eslint-disable-line
  maxNodes: number
  rateLimit: RateLimit
}): Promise<T> => {
  const fetchedNodes: GitHubNode[] = await getNodesPagination({
    ghClient: ghClient,
    cursor: null,
    increment: maxNodes,
    graphQLQuery: graphQLQuery,
    // eslint-disable-next-line
    queryParams: queryParams,
    rateLimit: rateLimit,
    errorRetry: 0,
    fetchedNodes: []
  })
  return fetchedNodes as T
}
