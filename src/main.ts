import * as core from '@actions/core'

import {
  getOrgByName,
  getOrgRepos,
  getLabels,
  getRateLimit,
  updateLabel,
  createLabel,
  deleteLabel
} from './graphql'
import { fetchNodesByQuery, graphqlQuery, mutateGitHubNodes } from './queries'
import {
  timeSinceStart,
  formatDate,
  ghClient,
  filterRepos,
  processRateLimit,
  saveLabels,
  findLabelsToCreate,
  findLabelsToDelete,
  findLabelsToUpdate
} from './utils'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const startTime = new Date()
    core.info(`Started job at: ${formatDate(startTime)}`)

    const gClient = ghClient(core.getInput('token'))

    // Perform a query to check the rate limit for the current user
    const rateLimitResponse: RateLimitResponse =
      await graphqlQuery<RateLimitResponse>({
        client: gClient,
        query: getRateLimit,
        variables: null
      })
    await processRateLimit(rateLimitResponse.rateLimit)

    // Find the GitHub org by name
    // This also useful to verify that the org actually exists
    const orgResponse: OrgResponse = await core.group(
      `${timeSinceStart(startTime)} 🗒️ Verifying org: ${core.getInput('org')}`,
      async () => {
        const orgResponse: OrgResponse = await graphqlQuery<OrgResponse>({
          client: gClient,
          query: getOrgByName,
          variables: { orgName: core.getInput('org') },
          rateLimit: rateLimitResponse.rateLimit
        })
        if (orgResponse.organization === null) {
          throw new Error(
            `Organization not found: ${core.getInput('org')}, check your token and the provided org name`
          )
        } else {
          core.info(
            `Organization found: ${orgResponse.organization.login}, with ID: ${orgResponse.organization.id}`
          )
        }
        return orgResponse
      }
    )

    // Fetch all repositories from the GitHub org
    // Only fetching a limited set of data to avoid hitting the rate limit from the start
    const sourceRepos: Repo[] = await core.group(
      `${timeSinceStart(startTime)} 📠 Initial fetch of all repositories`,
      async () => {
        core.info(
          `Fetching Repos from GitHub org: ${core.getInput('org')} withn ID: ${orgResponse.organization.id} using query increment: ${core.getInput('max_query_nodes')}`
        )
        const fetchReposData: Repo[] = await fetchNodesByQuery<Repo[]>({
          ghClient: gClient,
          graphQLQuery: getOrgRepos,
          queryParams: { orgId: orgResponse.organization.id },
          maxNodes: parseInt(core.getInput('max_query_nodes'), 10),
          rateLimit: orgResponse.rateLimit
        })
        return fetchReposData
      }
    )

    // Filter the repositories based on the input parameters
    core.info(
      `GitHub Org: ${orgResponse.organization.login} contains a total of ${sourceRepos.length} repositories`
    )
    const filteredRepos = filterRepos({
      repos: sourceRepos,
      filterTopics:
        core.getInput('filter_topics').length > 0
          ? core.getInput('filter_topics').split(',')
          : [],
      filterOperator: core.getInput('filter_operator'),
      filterIgnoreArchived: true
    })

    if (filteredRepos.length === 0) {
      core.warning('No repositories found based on the filter criteria')
      return
    }

    core.info(
      `After filtering, labels will be collected for ${filteredRepos.length} repositories`
    )

    // Check if the src_repository is part of the filtered list, if not add it to get its labels
    const srcRepoParam = core.getInput('src_repository')
    const sourceRepo = sourceRepos.find(repo => repo.name === srcRepoParam)
    if (sourceRepo === undefined) {
      core.warning(
        `Source repository ${srcRepoParam} not found in the org ${core.getInput('org')}, please update the src_repository input`
      )
      return
    } else if (
      filteredRepos.find(repo => repo.name === srcRepoParam) === undefined &&
      sourceRepo !== undefined
    ) {
      filteredRepos.push(sourceRepo)
    }

    let fetchedLabels: Label[] = await core.group(
      `${timeSinceStart(startTime)} 📠 Fetching ALL labels from ALL ${filteredRepos.length} repositories (filters + src_repository)`,
      async () => {
        let labels: Label[] = []
        for (const repo of filteredRepos) {
          core.info(`Processing repositopry: ${repo.name}`)
          const fetchedLabelsData: Label[] = await fetchNodesByQuery<Label[]>({
            ghClient: gClient,
            graphQLQuery: getLabels,
            queryParams: { repoId: repo.id },
            maxNodes: parseInt(core.getInput('max_query_nodes'), 10),
            rateLimit: orgResponse.rateLimit
          })
          labels = [...labels, ...fetchedLabelsData]
        }
        return labels
      }
    )
    core.info(
      `Fetched a total of ${fetchedLabels.length} labels across ${filteredRepos.length} repositories`
    )

    const srcRepositoryLabels = fetchedLabels.filter(
      (l: Label) => l.repository.name === srcRepoParam
    )
    // Removed from fetchedLabels the labels from src_repository
    fetchedLabels = fetchedLabels.filter(
      (l: Label) => l.repository.name !== srcRepoParam
    )

    const labelsToCreate = await core.group(
      `${timeSinceStart(startTime)} 📠 Preparing the list of labels to CREATE`,
      // eslint-disable-next-line @typescript-eslint/require-await
      async () => {
        return findLabelsToCreate(
          srcRepositoryLabels,
          fetchedLabels,
          filteredRepos
        )
      }
    )

    const labelsToUpdate: Label[] = await core.group(
      `${timeSinceStart(startTime)} 📠 Preparing the list of labels to UPDATE`,
      // eslint-disable-next-line @typescript-eslint/require-await
      async () => {
        return findLabelsToUpdate(
          srcRepositoryLabels,
          fetchedLabels,
          filteredRepos
        )
      }
    )

    const labelsToDelete = await core.group(
      `${timeSinceStart(startTime)} 📠 Preparing the list of labels to DELETE`,
      // eslint-disable-next-line @typescript-eslint/require-await
      async () => {
        return findLabelsToDelete(
          srcRepositoryLabels,
          fetchedLabels,
          filteredRepos
        )
      }
    )

    await core.group(
      `${timeSinceStart(startTime)} 🗄️ Creating labels`,
      async () => {
        core.info(`Will be creating a total of ${labelsToCreate.length} labels`)
        // Function to display logs while data is being submitted by mutateGithubNodes
        const getProgressData = (node: Label): string => {
          return ` - Repository: ${node.repository.url} - Label: ${node.name} ...created`
        }

        const getMutationVariables = (node: Label): object => {
          return {
            repositoryId: node.repository.id,
            name: node.name,
            color: node.color,
            description: node.description
          }
        }

        await mutateGitHubNodes({
          gClient: gClient,
          nodes: labelsToCreate,
          mutationQuery: createLabel,
          getMutationVariables: getMutationVariables,
          getProgressData: getProgressData,
          rateLimitCheck: 100
        })
      }
    )

    await core.group(
      `${timeSinceStart(startTime)} 🗄️ Updating labels`,
      async () => {
        core.info(`Will be updating a total of ${labelsToUpdate.length} labels`)
        // Function to display logs while data is being submitted by mutateGithubNodes
        const getProgressData = (node: Label): string => {
          return ` - Repository: ${node.repository.url} - Label: ${node.name} ...updated`
        }

        const getMutationVariables = (node: Label): object => {
          return {
            labelId: node.id,
            name: node.name,
            color: node.color,
            description: node.description
          }
        }

        await mutateGitHubNodes({
          gClient: gClient,
          nodes: labelsToUpdate,
          mutationQuery: updateLabel,
          getMutationVariables: getMutationVariables,
          getProgressData: getProgressData,
          rateLimitCheck: 100
        })
      }
    )

    await core.group(
      `${timeSinceStart(startTime)} 🗄️ Deleting labels`,
      async () => {
        core.info(`Will be deleting a total of ${labelsToDelete.length} labels`)
        // Function to display logs while data is being submitted by mutateGithubNodes
        const getProgressData = (node: Label): string => {
          return ` - Repository: ${node.repository.url} - Label: ${node.name} ...deleted`
        }

        const getMutationVariables = (node: Label): object => {
          return {
            labelId: node.id
          }
        }

        await mutateGitHubNodes({
          gClient: gClient,
          nodes: labelsToDelete,
          mutationQuery: deleteLabel,
          getMutationVariables: getMutationVariables,
          getProgressData: getProgressData,
          rateLimitCheck: 100
        })
      }
    )

    await core.group(
      `${timeSinceStart(startTime)} 📠 Saving labels as artifacts for further analysis`,
      async () => {
        await saveLabels([
          { filename: 'all-labels-all-repos.ndjson', labels: fetchedLabels },
          { filename: 'labelsToCreate.ndjson', labels: labelsToCreate },
          { filename: 'labelsToUpdate.ndjson', labels: labelsToUpdate },
          { filename: 'labelsToDelete.ndjson', labels: labelsToDelete }
        ])
      }
    )
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
