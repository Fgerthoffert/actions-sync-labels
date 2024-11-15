import * as core from '@actions/core'

/**
 * Filters a list of repositories based on specified criteria.
 *
 * @param {Object} params - The parameters for filtering repositories.
 * @param {Repo[]} params.repos - The list of repositories to filter.
 * @param {string[]} params.filterTopics - The list of topics to filter by.
 * @param {string} params.filterOperator - The operator to use for filtering ('AND' or 'OR').
 * @param {boolean} params.filterIgnoreArchived - Whether to ignore archived repositories.
 * @returns {Repo[]} The filtered list of repositories.
 *
 * @example
 * const filteredRepos = filterRepos({
 *   repos: allRepos,
 *   filterTopics: ['javascript', 'typescript'],
 *   filterOperator: 'AND',
 *   filterIgnoreArchived: true
 * });
 */
export const filterRepos = ({
  repos,
  filterTopics,
  filterOperator,
  filterIgnoreArchived
}: {
  repos: Repo[]
  filterTopics: string[]
  filterOperator: string
  filterIgnoreArchived: boolean
}): Repo[] => {
  core.debug(`Filtering repos with topics: ${JSON.stringify(filterTopics)}`)
  core.debug(`Filtering repos with Operator: ${filterOperator}`)
  core.debug(`Filtering repos with Ignore Archived: ${filterIgnoreArchived}`)
  return repos.filter(repo => {
    if (repo.isArchived === true && filterIgnoreArchived === true) {
      return false
    }

    //If the topic filter is empty, return all repos
    if (filterTopics.length === 0) {
      return true
    }

    const repoTopics =
      repo.repositoryTopics.totalCount > 0
        ? repo.repositoryTopics.edges.map(e => e.node.topic.name)
        : []

    //If the topic filter only contains "EMPTY", return all repos without topics
    if (
      filterTopics.length === 1 &&
      filterTopics.includes('EMPTY') &&
      repoTopics.length === 0
    ) {
      return true
    }

    if (filterOperator === 'AND') {
      let filterMatch = 0
      for (const topic of filterTopics) {
        if (repoTopics.includes(topic)) {
          filterMatch++
        }
      }
      return filterMatch === filterTopics.length
    } else {
      for (const topic of filterTopics) {
        if (
          repoTopics.includes(topic) ||
          (repoTopics.length === 0 && topic === 'EMPTY')
        ) {
          return true
        }
      }
      return false
    }
  })
}
