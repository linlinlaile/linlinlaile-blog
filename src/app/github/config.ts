/**
 * GitHub 页面配置
 */
export const GITHUB_CONFIG = {
  /** 你的 GitHub 用户名，用于自动拉取仓库列表 */
  username: 'linlinlaile',

  /** 不想在页面上显示的仓库名 */
  excludeRepos: [] as string[],

  /** 最多显示的自动仓库数 */
  maxRepos: 30,

  /**
   * 手动添加的参与项目
   *
   * 当你有参与其他人的项目、但不在自己仓库列表里时，
   * 在这里手动配置。支持两种写法：
   *
   * 1. 完整对象（推荐）：
   *    { owner: 'sjyinzju', repo: 'Galcode_island', stars: 10, languages: ['Python'] }
   *
   * 2. 只填 repo 全名（owner/repo），其他信息自动通过 GitHub API 补齐：
   *    { fullName: 'sjyinzju/Galcode_island' }
   */
  manualRepos: [
    {
      owner: 'sjyinzju',
      repo: 'Galcode_island',
      stars: 10,
      languages: ['Python'],
    },
  ] as ManualRepo[],
}

export interface ManualRepo {
  owner: string
  repo: string
  /** Star 数（用于展示） */
  stars?: number
  /** 语言列表 */
  languages?: string[]
}
