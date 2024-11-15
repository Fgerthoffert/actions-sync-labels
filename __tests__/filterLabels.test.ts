import { expect } from '@jest/globals'
import * as core from '@actions/core'

import { findLabelsToCreate, findLabelsToDelete } from '../src/utils'

interface Label {
  name: string
  id: string
  color: string
  description: string
  repository: Repo
}

interface RepoTopics {
  totalCount: number
  edges: {
    node: {
      topic: {
        name: string
      }
    }
  }[]
}

interface Repo {
  id: string
  name: string
  url: string
  nameWithOwner: string
  isArchived: boolean
  owner: {
    login: string
  }
  repositoryTopics: RepoTopics
}

const srcRepositoryLabels: Label[] = [
  {
    name: 'bug',
    id: '1',
    color: 'red',
    description: 'bug',
    repository: {
      name: 'srcrepo',
      id: '',
      url: '',
      nameWithOwner: '',
      isArchived: false,
      owner: {
        login: ''
      },
      repositoryTopics: { totalCount: 0, edges: [] }
    }
  },
  {
    name: 'feature',
    id: '2',
    color: 'green',
    description: 'feature',
    repository: {
      name: 'srcrepo',
      id: '',
      url: '',
      nameWithOwner: '',
      isArchived: false,
      owner: {
        login: ''
      },
      repositoryTopics: { totalCount: 0, edges: [] }
    }
  },
  {
    name: '_delete_echo',
    id: '3',
    color: 'blue',
    description: 'tag_delete',
    repository: {
      name: 'srcrepo',
      id: '',
      url: '',
      nameWithOwner: '',
      isArchived: false,
      owner: {
        login: ''
      },
      repositoryTopics: { totalCount: 0, edges: [] }
    }
  },
  {
    name: 'one_rename_two',
    id: '3',
    color: 'blue',
    description: 'tag_rename',
    repository: {
      name: 'srcrepo',
      id: '',
      url: '',
      nameWithOwner: '',
      isArchived: false,
      owner: {
        login: ''
      },
      repositoryTopics: { totalCount: 0, edges: [] }
    }
  },
  {
    name: '_partial_area:',
    id: '3',
    color: 'blue',
    description: 'tag_partial',
    repository: {
      name: 'srcrepo',
      id: '',
      url: '',
      nameWithOwner: '',
      isArchived: false,
      owner: {
        login: ''
      },
      repositoryTopics: { totalCount: 0, edges: [] }
    }
  },
  {
    name: 'tag_rename',
    id: '4',
    color: 'yellow',
    description: 'tag_rename',
    repository: {
      name: 'srcrepo',
      id: '',
      url: '',
      nameWithOwner: '',
      isArchived: false,
      owner: {
        login: ''
      },
      repositoryTopics: { totalCount: 0, edges: [] }
    }
  },
  {
    name: 'tag_partial',
    id: '5',
    color: 'purple',
    description: 'tag_partial',
    repository: {
      name: 'srcrepo',
      id: '',
      url: '',
      nameWithOwner: '',
      isArchived: false,
      owner: {
        login: ''
      },
      repositoryTopics: { totalCount: 0, edges: [] }
    }
  }
]

const fetchedLabels: Label[] = [
  {
    name: 'bug',
    repository: {
      name: 'repo1',
      id: '',
      url: '',
      nameWithOwner: '',
      isArchived: false,
      owner: {
        login: ''
      },
      repositoryTopics: { totalCount: 0, edges: [] }
    },
    id: '1',
    color: 'red',
    description: 'bug'
  },
  {
    name: 'echo',
    repository: {
      name: 'repo1',
      id: '',
      url: '',
      nameWithOwner: '',
      isArchived: false,
      owner: {
        login: ''
      },
      repositoryTopics: { totalCount: 0, edges: [] }
    },
    id: '1',
    color: 'red',
    description: 'bug'
  },
  {
    name: 'one',
    repository: {
      name: 'repo2',
      id: '',
      url: '',
      nameWithOwner: '',
      isArchived: false,
      owner: {
        login: ''
      },
      repositoryTopics: { totalCount: 0, edges: [] }
    },
    id: '1',
    color: 'red',
    description: 'bug'
  },
  {
    name: 'Area:One',
    repository: {
      name: 'repo2',
      id: '',
      url: '',
      nameWithOwner: '',
      isArchived: false,
      owner: {
        login: ''
      },
      repositoryTopics: { totalCount: 0, edges: [] }
    },
    id: '1',
    color: 'red',
    description: 'bug'
  },
  {
    name: 'Area:Two',
    repository: {
      name: 'repo2',
      id: '',
      url: '',
      nameWithOwner: '',
      isArchived: false,
      owner: {
        login: ''
      },
      repositoryTopics: { totalCount: 0, edges: [] }
    },
    id: '1',
    color: 'red',
    description: 'bug'
  },
  {
    name: 'feature',
    repository: {
      name: 'repo2',
      id: '',
      url: '',
      nameWithOwner: '',
      isArchived: false,
      owner: {
        login: ''
      },
      repositoryTopics: { totalCount: 0, edges: [] }
    },
    id: '2',
    color: 'green',
    description: 'feature'
  }
]

const filteredRepos: Repo[] = [
  {
    name: 'repo1',
    id: '',
    url: '',
    nameWithOwner: '',
    isArchived: false,
    owner: {
      login: ''
    },
    repositoryTopics: { totalCount: 0, edges: [] }
  },
  {
    name: 'repo2',
    id: '',
    url: '',
    nameWithOwner: '',
    isArchived: false,
    owner: {
      login: ''
    },
    repositoryTopics: { totalCount: 0, edges: [] }
  },
  {
    name: 'repo3',
    id: '',
    url: '',
    nameWithOwner: '',
    isArchived: false,
    owner: {
      login: ''
    },
    repositoryTopics: { totalCount: 0, edges: [] }
  },
  {
    name: 'srcrepo',
    id: '',
    url: '',
    nameWithOwner: '',
    isArchived: false,
    owner: {
      login: ''
    },
    repositoryTopics: { totalCount: 0, edges: [] }
  }
]

describe('findLabelsToCreate', () => {
  beforeEach(() => {
    jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
      if (name === 'tag_delete') return '_delete_'
      if (name === 'tag_rename') return '_rename_'
      if (name === 'tag_partial') return '_partial_'
      if (name === 'src_repository') return 'srcrepo'
      return ''
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('It should not create labels with identified tags', () => {
    const labelsToCreate = findLabelsToCreate(
      srcRepositoryLabels,
      fetchedLabels,
      filteredRepos
    )
    const filteredLabels = labelsToCreate.filter(
      l =>
        !l.name.includes('_delete_') &&
        !l.name.includes('_rename_') &&
        !l.name.includes('_partial_')
    )
    expect(labelsToCreate).toHaveLength(filteredLabels.length)
  })

  it('should not create labels in the source repository', () => {
    jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
      if (name === 'src_repository') return 'srcrepo'
      return ''
    })

    const labelsToCreate = findLabelsToCreate(
      srcRepositoryLabels,
      fetchedLabels,
      filteredRepos
    )
    const filteredLabels = labelsToCreate.filter(
      l => !l.repository.name.includes('srcrepo')
    )
    expect(labelsToCreate).toHaveLength(filteredLabels.length)
  })

  it('should create labels in repositories where they do not exist', () => {
    const labelsToCreate = findLabelsToCreate(
      srcRepositoryLabels,
      fetchedLabels,
      filteredRepos
    )
    const filteredLabels = labelsToCreate.filter(
      l =>
        l.name.includes('_delete_') ||
        l.name.includes('_rename_') ||
        l.name.includes('_partial_')
    )
    expect(filteredLabels).toHaveLength(0)
    expect(labelsToCreate).toHaveLength(10)
    expect(labelsToCreate[0].name).toBe('bug')
    expect(labelsToCreate[0].repository?.name).toBe('repo2')
  })
})

describe('findLabelsToDelete', () => {
  beforeEach(() => {
    jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
      if (name === 'tag_delete') return '_delete_'
      if (name === 'tag_rename') return '_rename_'
      if (name === 'tag_partial') return '_partial_'
      if (name === 'src_repository') return 'srcrepo'
      return ''
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('It should only delete labels with the _delete_ tag', () => {
    const labelsToCreate = findLabelsToDelete(
      srcRepositoryLabels,
      fetchedLabels,
      filteredRepos
    )

    expect(labelsToCreate).toHaveLength(1)
  })
})
