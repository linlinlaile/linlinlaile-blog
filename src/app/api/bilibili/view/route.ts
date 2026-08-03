import { NextRequest } from 'next/server'

/**
 * Bilibili 视频信息 API 代理
 *
 * GET /api/bilibili/view?bvid=BVxxxx
 *
 * 在服务端请求 Bilibili API，避免浏览器 CORS 和 Referer 校验问题。
 * 返回 Bilibili /x/web-interface/view 接口的原始 JSON。
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const bvid = searchParams.get('bvid')

  if (!bvid) {
    return Response.json({ code: -1, message: 'Missing bvid parameter' }, { status: 400 })
  }

  // BV 号基本格式校验：以 BV 开头
  if (!/^BV\w{8,}$/.test(bvid)) {
    return Response.json({ code: -1, message: 'Invalid bvid format' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://api.bilibili.com/x/web-interface/view?bvid=${encodeURIComponent(bvid)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BlogBot/1.0)',
          Referer: 'https://www.bilibili.com/',
        },
        // 服务端 fetch 可在部署环境设置更长的超时
        signal: AbortSignal.timeout(10_000),
      },
    )

    if (!res.ok) {
      return Response.json(
        { code: -1, message: `Bilibili API returned ${res.status}` },
        { status: res.status },
      )
    }

    const data = await res.json()
    return Response.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ code: -1, message }, { status: 500 })
  }
}
