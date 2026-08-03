/**
 * Bilibili 视频展示配置
 *
 * 将你希望展示的视频 BV 号添加到 BILIBILI_BVIDS 数组中。
 * 每个 BV 号会通过 /api/bilibili/view 获取视频信息。
 */
export interface BilibiliVideoEntry {
  bvid: string
  note?: string
}

export const BILIBILI_BVIDS: string[] = ['BV1QsTC68Eav','BV1n2KU6oE2K','BV1eYEY6eEBR','BV14C9YB6E3h','BV1f6oaBeEU5',
  'BV17RDkBVEPj','BV19MDsBDEH8','BV1uv9gBmEaZ','BV1i1XNBrEPx','BV11sAAzCEYm','BV1vjAEzNEg3','BV1GWwxzSEfN','BV1NkckzUEkf',
  'BV1CgAfzhE7K','BV1iYAbzPEn8','BV1svfxBhEnt','BV1W2ZZBJE6Y','BV1fXZYBME7K','BV1msZKBkE8V','BV1MEZsB8Ep5','BV1GacWzkEJd',
  'BV14pcezbENL','BV1g2FdzbEju'
  // 在这里添加你的视频 BV 号，例如：
  // 'BV1xx411c7mD',
]

/** Bilibili 空间主页（可选，用于页面上的 "查看更多" 链接） */
export const BILIBILI_SPACE_URL = ''
