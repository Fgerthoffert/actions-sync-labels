import * as core from '@actions/core'
import { DefaultArtifactClient } from '@actions/artifact'

import * as path from 'path'

/**
 * Uploads an artifact to the artifact storage at GitHub.
 *
 * @param {Object} params - The parameters for the artifact upload.
 * @param {string} params.artifactName - The name of the artifact.
 * @param {string} params.artifactPath - The path to the artifact directory.
 * @param {string} params.artifactFilename - The filename of the artifact.
 * @param {number} params.retentionDays - The number of days to retain the artifact.
 * @returns {Promise<void>} A promise that resolves when the artifact is successfully uploaded.
 */
export async function uploadArtifact({
  artifactName,
  artifactPath,
  artifactFilenames,
  retentionDays
}: {
  artifactName: string
  artifactPath: string
  artifactFilenames: string[]
  retentionDays: number
}): Promise<void> {
  const artifactClient = new DefaultArtifactClient()

  const uploadResponse = await artifactClient.uploadArtifact(
    artifactName,
    artifactFilenames.map(artifactFilename =>
      path.join(artifactPath, artifactFilename)
    ),
    artifactPath,
    {
      retentionDays: retentionDays
    }
  )
  core.info(
    `Uploaded artifact ID: ${uploadResponse.id} for a total size of: ${uploadResponse.size}`
  )
}
