import * as core from '@actions/core'

import * as path from 'path'
import * as fs from 'fs'
import os from 'os'

import { uploadArtifact, sortByName } from './'

interface LabelsArtifacts {
  filename: string
  labels: Label[]
}

export const saveLabels = async <T>(
  artifacts: LabelsArtifacts[]
): Promise<T> => {
  const tmpPath = os.tmpdir()

  for (const labelsArtifact of artifacts) {
    const tmpFilepath = path.join(tmpPath, labelsArtifact.filename)
    const labels = labelsArtifact.labels.sort(sortByName)

    for (const label of labels) {
      fs.writeFileSync(
        tmpFilepath,
        JSON.stringify({
          ...label,
          fetchedAt: new Date().toISOString()
        }) + '\n',
        { flag: 'a+' }
      )
    }
    core.info(`Labels saved to: ${tmpFilepath}`)
  }

  await uploadArtifact({
    artifactName: core.getInput('artifact_name'),
    artifactPath: tmpPath,
    artifactFilenames: artifacts.map(l => l.filename),
    retentionDays: parseInt(core.getInput('artifact_retention_days'), 10)
  })

  return {} as T
}
export default saveLabels
