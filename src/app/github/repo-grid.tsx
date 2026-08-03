'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { ExternalLink, Github, Star, GitFork } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RepoData {
  id: number
  name: string
  description: string | null
  html_url: string
  stargazers_count: number
  language: string | null
  topics: string[]
  fork: boolean
  updated_at: string
  /** 标记为参与项目（非自己仓库） */
  contributed?: boolean
}

interface RepoGridProps {
  repos: RepoData[]
}

export function RepoGrid({ repos }: RepoGridProps) {
  if (repos.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center px-6 pt-48'>
        <Github className='text-secondary mb-4 h-12 w-12' />
        <p className='text-secondary text-sm'>暂无仓库数据</p>
      </div>
    )
  }

  return (
    <div className='flex flex-col items-center justify-center px-6 pt-32 pb-12'>
      <div className='mb-8 text-center'>
        <h1 className='text-primary text-2xl font-bold'>GitHub</h1>
        <p className='text-secondary mt-2 text-sm'>开源项目与技术实践</p>
      </div>

      <div className='grid w-full max-w-[1200px] grid-cols-2 gap-6 max-md:grid-cols-1'>
        {repos.map((repo, index) => (
          <RepoCard key={repo.id} repo={repo} index={index} />
        ))}
      </div>
    </div>
  )
}

function RepoCard({ repo, index }: { repo: RepoData; index: number }) {
  // 简单的语言颜色映射
  const langColors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f7df1e',
    Python: '#3776ab',
    Go: '#00add8',
    Rust: '#dea584',
    Vue: '#42b883',
    CSS: '#563d7c',
    HTML: '#e34c26',
    Shell: '#89e051',
  }

  const langColor = repo.language ? langColors[repo.language] : undefined

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      viewport={{ once: true }}
      className='card relative flex flex-col gap-4'
    >
      {/* Header */}
      <div className='flex items-start gap-3'>
        <Github className='text-secondary mt-0.5 h-5 w-5 shrink-0' />
        <div className='min-w-0 flex-1'>
          <Link
            href={repo.html_url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary hover:text-brand inline-flex items-center gap-1.5 text-lg font-semibold transition-colors'
          >
            <span className='truncate'>{repo.name}</span>
            <ExternalLink className='h-3.5 w-3.5 shrink-0 opacity-50' />
          </Link>

          {repo.fork && (
            <span className='text-secondary ml-2 inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px]'>
              <GitFork className='h-3 w-3' />
              Fork
            </span>
          )}
          {repo.contributed && (
            <span className='text-brand ml-2 inline-flex items-center gap-1 rounded border border-current px-1.5 py-0.5 text-[10px]'>
              Contributed
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {repo.description && (
        <p className='text-secondary line-clamp-3 text-sm leading-relaxed'>{repo.description}</p>
      )}

      {/* Topics */}
      {repo.topics.length > 0 && (
        <div className='flex flex-wrap gap-1.5'>
          {repo.topics.slice(0, 6).map(topic => (
            <span key={topic} className='bg-secondary/10 text-secondary rounded-full px-2.5 py-0.5 text-[11px]'>
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className='text-secondary mt-auto flex items-center gap-4 text-xs'>
        {repo.language && (
          <span className='flex items-center gap-1.5'>
            <span
              className='inline-block h-2.5 w-2.5 rounded-full'
              style={{ backgroundColor: langColor || '#9ca3af' }}
            />
            {repo.language}
          </span>
        )}

        <span className='flex items-center gap-1'>
          <Star className='h-3.5 w-3.5' />
          {repo.stargazers_count}
        </span>

        <Link
          href={repo.html_url}
          target='_blank'
          rel='noopener noreferrer'
          className='bg-card hover:bg-bg ml-auto rounded-lg border px-3 py-1.5 font-medium transition-colors'
        >
          View
        </Link>
      </div>
    </motion.div>
  )
}
