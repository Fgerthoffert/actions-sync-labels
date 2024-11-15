interface RateLimit {
  limit: number
  cost: number
  remaining: number
  resetAt: string | null
}

interface RateLimitResponse {
  rateLimit: RateLimit
}

interface GhNode {
  totalCount: number
  edges: {
    cursor: string
    node: Repo
  }[]
}

interface GitHubNode {
  id: string
}

interface BaseQueryResponse {
  rateLimit: RateLimit
  viewer?: {
    ghNode: GhNode
  }
  node?: {
    ghNode: GhNode
  }
  nodes?: GitHubNode[]
}

interface Org {
  name: string
  login: string
  id: string
}

interface OrgResponse {
  organization: Org
  rateLimit: RateLimit
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

interface GraphQLApiResponse {
  data: {
    rateLimit: RateLimit
  }
}

interface Label {
  id: string
  color: string
  name: string
  description: string
  repository: Repo
}
