import { GITHUB_CONFIG, type ManualRepo } from './config'
import { RepoGrid, type RepoData } from './repo-grid'

export const dynamic = 'force-static'
export const revalidate = 3600 // ISR: 每小时重新验证一次

interface ManualRepoData {
  name: string // owner/repo
  html_url: string
  description: string | null
  stargazers_count: number
  language: string | null
  topics: string[]
  /** 标记为参与项目 */
  contributed: true
}

/**
 * GitHub 技术展示页面
 *
 * 服务端渲染 + ISR 缓存。从 GitHub 公开 API 获取仓库列表，
 * 并合并手动配置的参与项目。
 */
export default async function GithubPage() {
  // 1. 从 GitHub API 获取自己的仓库
  const ownRepos = await fetchOwnRepos()

  // 2. 获取手动配置的参与项目信息
  const manualRepos = await fetchManualRepos(GITHUB_CONFIG.manualRepos ?? [])

  // 合并：自己仓库在前，参与项目在后
  const allRepos = [...ownRepos, ...manualRepos]

  return <RepoGrid repos={allRepos} />
}

async function fetchOwnRepos(): Promise<RepoData[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_CONFIG.username}/repos?sort=updated&per_page=${GITHUB_CONFIG.maxRepos}&type=owner`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'Blog/1.0',
        },
        next: { revalidate },
      },
    )

    if (!res.ok) return []

    const data = (await res.json()) as RepoData[]
    return data
      .filter(repo => !GITHUB_CONFIG.excludeRepos.includes(repo.name))
      .slice(0, GITHUB_CONFIG.maxRepos)
  } catch {
    return []
  }
}

async function fetchManualRepos(manual: ManualRepo[]): Promise<(RepoData | ManualRepoData)[]> {
  if (manual.length === 0) return []

  const results = await Promise.allSettled(
    manual.map(async (mr): Promise<RepoData | ManualRepoData> => {
      // 尝试通过 GitHub API 获取真实数据
      try {
        const res = await fetch(`https://api.github.com/repos/${mr.owner}/${mr.repo}`, {
          headers: {
            Accept: 'application/vnd.github+json',
            'User-Agent': 'Blog/1.0',
          },
          next: { revalidate },
        })

        if (res.ok) {
          const data = (await res.json()) as RepoData
          return { ...data, contributed: true as const }
        }
      } catch {
        // API 失败时使用降级数据
      }

      // 降级：用 config 提供的信息构造条目
      return {
        id: 0, // 手动条目无 id
        name: `${mr.owner}/${mr.repo}`,
        html_url: `https://github.com/${mr.owner}/${mr.repo}`,
        description: null,
        stargazers_count: mr.stars ?? 0,
        language: mr.languages?.[0] ?? null,
        topics: mr.languages ?? [],
        fork: false,
        updated_at: '',
        contributed: true as const,
      }
    }),
  )

  return results
    .filter((r): r is PromiseFulfilledResult<RepoData | ManualRepoData> => r.status === 'fulfilled')
    .map(r => r.value)
}
