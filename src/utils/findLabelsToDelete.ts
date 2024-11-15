import * as core from '@actions/core'

/**
 * Finds labels to delete from the source repository based on a specific tag and the labels present in other repositories.
 *
 * @param srcRepositoryLabels - An array of labels from the source repository.
 * @param fetchedLabels - An array of labels fetched from other repositories.
 * @param filteredRepos - An array of repositories to filter the labels.
 * @returns An array of labels that should be deleted.
 */
export const findLabelsToDelete = (
  srcRepositoryLabels: Label[],
  fetchedLabels: Label[],
  filteredRepos: Repo[]
): Label[] => {
  const labelsToDelete = srcRepositoryLabels
    .filter(
      l =>
        l.name.includes(core.getInput('tag_delete')) &&
        core.getInput('tag_delete') !== ''
    )
    .reduce((acc: Label[], label: Label) => {
      const labelNameToDelete = label.name.replace(
        core.getInput('tag_delete'),
        ''
      )

      // Search for the label in every single repositories
      for (const repo of filteredRepos) {
        const repoLabel = fetchedLabels.find(
          (l: Label) =>
            l.repository.name === repo.name && l.name === labelNameToDelete
        )
        if (repoLabel !== undefined) {
          core.info(
            `Label: ${labelNameToDelete} will be deleted from repository: ${repo.name}`
          )
          acc.push(repoLabel)
        }
      }
      return acc
    }, [])
  return labelsToDelete
}
export default findLabelsToDelete
