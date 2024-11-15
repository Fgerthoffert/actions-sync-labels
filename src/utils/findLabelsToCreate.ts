import * as core from '@actions/core'

/**
 * Finds labels that need to be created in the specified repositories.
 *
 * This function filters out labels that contain certain tags (delete, rename, partial)
 * and then checks if these labels exist in the repositories. If a label does not
 * exist in a repository, it is added to the list of labels to be created.
 *
 * @param srcRepositoryLabels - The labels from the source repository.
 * @param fetchedLabels - The labels fetched from the target repositories.
 * @param filteredRepos - The repositories where labels need to be checked and potentially created.
 * @returns An array of labels that need to be created in the specified repositories.
 */
export const findLabelsToCreate = (
  srcRepositoryLabels: Label[],
  fetchedLabels: Label[],
  filteredRepos: Repo[]
): Label[] => {
  const labelsToCreate = srcRepositoryLabels
    // Removed labels containing tag_delete and tag_rename since we don't want to create them
    .filter((l: Label) => !l.name.includes(core.getInput('tag_delete')))
    .filter((l: Label) => !l.name.includes(core.getInput('tag_rename')))
    .filter((l: Label) => !l.name.includes(core.getInput('tag_partial')))
    .reduce((acc: Label[], label: Label) => {
      // Search for the label in every single repositories
      for (const repo of filteredRepos.filter(
        r => r.name !== core.getInput('src_repository')
      )) {
        const repoLabel = fetchedLabels.find(
          (l: Label) => l.repository.name === repo.name && l.name === label.name
        )
        if (repoLabel === undefined) {
          core.info(
            `Label: ${label.name} will be created in repository: ${repo.name}`
          )
          acc.push({ ...label, repository: repo })
        }
      }
      return acc
    }, [])
  return labelsToCreate
}
export default findLabelsToCreate
