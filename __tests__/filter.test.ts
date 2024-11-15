/**
 * Unit tests for src/filterRepos.ts
 */

import { filterRepos } from '../src/utils/filterRepos'
import { expect } from '@jest/globals'

interface RepoCustomProperties {
  totalCount: number
  edges: {
    node: {
      name: string
      values: string[]
    }
  }[]
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
  customProperties: RepoCustomProperties
  repositoryTopics: RepoTopics
}

const customProperties: RepoCustomProperties = {
  totalCount: 0,
  edges: []
}

const repos: Repo[] = [
  {
    id: 'a',
    name: 'repo1',
    url: 'url',
    isArchived: true,
    nameWithOwner: 'owner/repo1',
    customProperties: customProperties,
    owner: {
      login: 'owner'
    },
    repositoryTopics: {
      totalCount: 1,
      edges: [
        {
          node: {
            topic: { name: 'topic1' }
          }
        }
      ]
    }
  },
  {
    id: 'b',
    name: 'repo2',
    url: 'url',
    isArchived: false,
    nameWithOwner: 'owner/repo2',
    customProperties: customProperties,
    owner: {
      login: 'owner'
    },
    repositoryTopics: {
      totalCount: 1,
      edges: [
        {
          node: {
            topic: { name: 'topic1' }
          }
        },
        {
          node: {
            topic: { name: 'topic2' }
          }
        }
      ]
    }
  },
  {
    id: 'c',
    name: 'repo3',
    url: 'url',
    isArchived: false,
    nameWithOwner: 'owner/repo3',
    customProperties: customProperties,
    owner: {
      login: 'owner'
    },
    repositoryTopics: {
      totalCount: 1,
      edges: [
        {
          node: {
            topic: { name: 'topic1' }
          }
        },
        {
          node: {
            topic: { name: 'topic2' }
          }
        }
      ]
    }
  },
  {
    id: 'd',
    name: 'repo4',
    url: 'url',
    isArchived: false,
    nameWithOwner: 'owner/repo4',
    customProperties: customProperties,
    owner: {
      login: 'owner'
    },
    repositoryTopics: {
      totalCount: 1,
      edges: [
        {
          node: {
            topic: { name: 'topic1' }
          }
        },
        {
          node: {
            topic: { name: 'topic3' }
          }
        }
      ]
    }
  },
  {
    id: 'e',
    name: 'repo5',
    url: 'url',
    isArchived: false,
    nameWithOwner: 'owner/repo5',
    customProperties: customProperties,
    owner: {
      login: 'owner'
    },
    repositoryTopics: {
      totalCount: 0,
      edges: []
    }
  },
  {
    id: 'f',
    name: 'repo6',
    url: 'url',
    isArchived: true,
    nameWithOwner: 'owner/repo6',
    customProperties: customProperties,
    owner: {
      login: 'owner'
    },
    repositoryTopics: {
      totalCount: 0,
      edges: []
    }
  }
]

describe('filterRepos.ts', () => {
  it('Do not perform any filtering', () => {
    let filteredRepos: Repo[] = filterRepos({
      repos: repos,
      filterTopics: [],
      filterOperator: 'AND',
      filterIgnoreArchived: false
    })
    expect(filteredRepos.length).toEqual(repos.length)

    filteredRepos = filterRepos({
      repos: repos,
      filterTopics: [],
      filterOperator: 'OR',
      filterIgnoreArchived: false
    })
    expect(filteredRepos.length).toEqual(repos.length)
  })

  it('Only return repos without topics and not archived', () => {
    const filteredRepos = filterRepos({
      repos: repos,
      filterTopics: ['EMPTY'],
      filterOperator: 'OR',
      filterIgnoreArchived: true
    })
    expect(filteredRepos.length).toEqual(1)
  })

  it('Only return repos without topics, archived or not', () => {
    const filteredRepos = filterRepos({
      repos: repos,
      filterTopics: ['EMPTY'],
      filterOperator: 'OR',
      filterIgnoreArchived: false
    })
    expect(filteredRepos.length).toEqual(2)
  })

  it('Filter out archived repos', () => {
    const filteredRepos: Repo[] = filterRepos({
      repos: repos,
      filterTopics: [],
      filterOperator: 'AND',
      filterIgnoreArchived: true
    })

    expect(filteredRepos.filter(r => r.isArchived === true).length).toEqual(0)
    expect(
      filteredRepos.filter(r => r.isArchived === false).length
    ).toBeGreaterThan(0)
  })

  it('All repos containing topic1 and not archived', () => {
    const filteredRepos = filterRepos({
      repos: repos,
      filterTopics: ['topic1'],
      filterOperator: 'AND',
      filterIgnoreArchived: true
    })

    expect(filteredRepos.length).toEqual(3)
  })

  it('All repos containing topic1, archived or not', () => {
    const filteredRepos = filterRepos({
      repos: repos,
      filterTopics: ['topic1'],
      filterOperator: 'AND',
      filterIgnoreArchived: false
    })

    expect(filteredRepos.length).toEqual(4)
  })

  it('All repos containing topic1 or topic3 and not archived', () => {
    const filteredRepos = filterRepos({
      repos: repos,
      filterTopics: ['topic1', 'topic3'],
      filterOperator: 'OR',
      filterIgnoreArchived: true
    })

    expect(filteredRepos.length).toEqual(3)
  })

  it('All repos containing topic1 or topic3, archived or not', () => {
    const filteredRepos = filterRepos({
      repos: repos,
      filterTopics: ['topic1', 'topic3'],
      filterOperator: 'OR',
      filterIgnoreArchived: false
    })

    expect(filteredRepos.length).toEqual(4)
  })

  it('All repos containing topic1 and topic2 and not archived', () => {
    const filteredRepos = filterRepos({
      repos: repos,
      filterTopics: ['topic1', 'topic2'],
      filterOperator: 'AND',
      filterIgnoreArchived: true
    })

    expect(filteredRepos.length).toEqual(2)
  })

  it('All repos containing topic1 and topic2, archived or not', () => {
    const filteredRepos = filterRepos({
      repos: repos,
      filterTopics: ['topic1', 'topic2'],
      filterOperator: 'AND',
      filterIgnoreArchived: false
    })

    expect(filteredRepos.length).toEqual(2)
  })

  it('All repos containing topic1 and topic3 and not archived', () => {
    const filteredRepos = filterRepos({
      repos: repos,
      filterTopics: ['topic1', 'topic3'],
      filterOperator: 'AND',
      filterIgnoreArchived: true
    })

    expect(filteredRepos.length).toEqual(1)
  })

  it('All repos containing topic1 and topic3, archived or not', () => {
    const filteredRepos = filterRepos({
      repos: repos,
      filterTopics: ['topic1', 'topic3'],
      filterOperator: 'AND',
      filterIgnoreArchived: false
    })

    expect(filteredRepos.length).toEqual(1)
  })

  it('All repos containing topic3 OR no topic and not archived', () => {
    const filteredRepos = filterRepos({
      repos: repos,
      filterTopics: ['EMPTY', 'topic3'],
      filterOperator: 'OR',
      filterIgnoreArchived: true
    })

    expect(filteredRepos.length).toEqual(2)
  })

  it('All repos containing topic3 OR no topic , archived or not', () => {
    const filteredRepos = filterRepos({
      repos: repos,
      filterTopics: ['EMPTY', 'topic3'],
      filterOperator: 'OR',
      filterIgnoreArchived: false
    })

    expect(filteredRepos.length).toEqual(3)
  })
})
