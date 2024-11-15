import * as core from '@actions/core'

export const updateLabelContent = (
  srcLabel: Label,
  dstLabel: Label
): Label | null => {
  let label = srcLabel
  const modifiedFields = []
  if (srcLabel.name !== dstLabel.name) {
    label = {
      ...label,
      name: dstLabel.name
    }
    modifiedFields.push('name')
  }
  if (srcLabel.description !== dstLabel.description) {
    label = {
      ...label,
      description: dstLabel.description
    }
    modifiedFields.push('description')
  }
  if (srcLabel.color !== dstLabel.color) {
    label = {
      ...label,
      color: dstLabel.color
    }
    modifiedFields.push('color')
  }
  if (modifiedFields.length > 0) {
    core.info(
      `Label: ${label.name} will be updated in repository: ${label.repository.name} - Fields to be updated: ${modifiedFields.toString()}`
    )
    return label
  }
  return null
}
export default updateLabelContent
