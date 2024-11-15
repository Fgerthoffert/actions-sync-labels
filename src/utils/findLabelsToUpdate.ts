import * as core from '@actions/core'

import { updateLabelContent } from './'

export const findLabelsToUpdate = (
  srcRepositoryLabels: Label[],
  fetchedLabels: Label[],
  filteredRepos: Repo[]
): Label[] => {
  const labelsToUpdate = srcRepositoryLabels
    // Removed labels containing tag_delete since we don't want to act on them
    .filter((l: Label) => !l.name.includes(core.getInput('tag_delete')))
    .reduce((acc: Label[], label: Label) => {
      for (const repo of filteredRepos) {
        if (label.name.includes(core.getInput('tag_rename'))) {
          // The label contains renaming instructions, so we're searching for labelSrc in the repo
          const [labelSrc, labelDst] = label.name.split(
            core.getInput('tag_rename')
          )
          if (labelSrc.length > 0 && labelDst.length > 0) {
            // Verify we're renaming from and to a label that exists
            const repoLabelSrc = fetchedLabels.find(
              (l: Label) =>
                l.repository.name === repo.name && l.name === labelSrc
            )
            const repoLabelDst = fetchedLabels.find(
              (l: Label) =>
                l.repository.name === repo.name && l.name === labelDst
            )
            if (repoLabelDst !== undefined && repoLabelSrc !== undefined) {
              core.warning(
                `Unable to rename label: ${labelSrc} in repository: ${repo.name} - Destination label: ${labelDst} already exists and cannot be overwritten`
              )
            } else if (repoLabelSrc !== undefined) {
              core.info(
                `Label: ${labelSrc} in repository: ${repo.name} will be renamed to: ${labelDst}`
              )
              const updatedLabel = updateLabelContent(repoLabelSrc, {
                ...repoLabelSrc,
                name: labelDst,
                color: label.color,
                description: label.description
              })
              if (updatedLabel !== null) {
                acc.push(updatedLabel)
              }
            }
          }
        } else if (label.name.includes(core.getInput('tag_partial'))) {
          // Search for labels containing part of the label name from the src_repository
          const repoLabels = fetchedLabels.filter(
            (l: Label) =>
              l.repository.name === repo.name &&
              l.name.includes(
                label.name.replace(core.getInput('tag_partial'), '')
              )
          )
          for (const repoLabel of repoLabels) {
            const updatedLabel = updateLabelContent(repoLabel, {
              ...label,
              name: repoLabel.name
            })
            if (updatedLabel !== null) {
              acc.push(updatedLabel)
            }
          }
        } else {
          const repoLabel = fetchedLabels.find(
            (l: Label) =>
              l.repository.name === repo.name && l.name === label.name
          )
          if (repoLabel !== undefined) {
            const updatedLabel = updateLabelContent(repoLabel, label)
            if (updatedLabel !== null) {
              acc.push(updatedLabel)
            }
          }
        }
      }
      return acc
    }, [])
  return labelsToUpdate
}
export default findLabelsToUpdate
