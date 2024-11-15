import * as core from '@actions/core'
import { DocumentNode } from 'apollo-link/lib/types'
import { NormalizedCacheObject } from 'apollo-cache-inmemory'
import ApolloClient from 'apollo-client'
import { processRateLimit, sleep } from '../utils/'

import { graphqlQuery } from './'
import { getRateLimit } from '../graphql'

export const mutateGitHubNodes = async <T>({
  gClient,
  nodes,
  mutationQuery,
  getMutationVariables,
  getProgressData,
  rateLimitCheck = 100
}: {
  gClient: ApolloClient<NormalizedCacheObject>
  nodes: Label[]
  mutationQuery: DocumentNode
  getMutationVariables: any // eslint-disable-line
  getProgressData: any // eslint-disable-line
  rateLimitCheck: number
}): Promise<T> => {
  let cpt = 0

  core.info(`Will trigger the mutation of ${nodes.length} nodes`)

  // Note that there is no retry mechanism here since the mutation
  // is considered simple enough (compare to complex mutation queries)

  for (const node of nodes) {
    await sleep(1000)

    if (cpt === rateLimitCheck) {
      cpt = 0
    }
    if (cpt === 0) {
      core.info(
        `Checking current status of the rate limit (once every ${rateLimitCheck} mutations)`
      )
      const rateLimitResponse: RateLimitResponse =
        await graphqlQuery<RateLimitResponse>({
          client: gClient,
          query: getRateLimit,
          variables: null
        })
      await processRateLimit(rateLimitResponse.rateLimit)
      cpt = 0
    }
    cpt++

    core.info(`${cpt}/${nodes.length} ${getProgressData(node)}`) // eslint-disable-line

    await graphqlQuery<BaseQueryResponse>({
      client: gClient,
      query: mutationQuery,
      variables: getMutationVariables(node) // eslint-disable-line
    })
  }
  return {} as T
}
