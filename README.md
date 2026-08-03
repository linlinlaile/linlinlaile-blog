# 2025 Blog

一个基于 **Next.js** 的现代化个人博客,所有内容（博客、分享、项目、图片等）都托管在 GitHub 仓库中,前端通过 **GitHub App** 直接读写仓库内容,无需后端服务。

## 功能特性

- **可拖拽首页**：首页由多张可自由拖拽、自由配置的卡片组成（时钟、日历、音乐、社交、艺术图、帽子等）
- **博客系统**：Markdown 写作与渲染，支持数学公式（KaTeX）、代码高亮（shiki）、目录与分类
- **在线写作**：内置 Markdown 编辑器，支持预览、封面与图片上传，发布后自动提交到 GitHub 仓库
- **GitHub App 管理**：在浏览器中完成内容增删改，通过 JWT 签发的安装令牌调用 GitHub API
- **多个内容模块**：文章、分享、项目、图片、博主、代码片段、SVG 图标、音乐列表等
- **Live2D 看板娘**：内置 Live2D 模型展示
- **Bilibili 集成**：展示视频与动态（含服务端 API 代理解决跨域）
- **Github 主页集成**：展示 GitHub 仓库列表
- **SEO 完善**：自动生成 RSS、sitemap

## 技术栈

- **框架**：Next.js 16（Turbopack）、React 19、TypeScript
- **样式**：Tailwind CSS 4
- **状态**：Zustand + SWR
- **渲染**：marked + KaTeX + shiki + html-react-parser
- **动效**：motion、tailwindcss-animate
- **认证**：jsrsasign（GitHub App JWT 签名）
- **部署**：Vercel / Cloudflare Workers（opennextjs-cloudflare + wrangler）

## 目录结构

```
├── public/
│   ├── blogs/          # 博客内容（markdown + 图片 + 索引）
│   ├── images/         # 图片素材
│   ├── live2d/         # Live2D 模型
│   └── music/          # 音乐文件
├── scripts/
│   └── gen-svgs-index.js   # 生成 SVG 索引
└── src/
    ├── app/            # Next.js App Router 页面
    ├── components/     # 通用组件
    ├── config/         # 站点配置（主题、社交、卡片样式）
    ├── hooks/          # 自定义 Hook
    ├── layout/         # 布局组件（页头、页脚、背景）
    ├── lib/            # 核心库（GitHub 客户端、认证、渲染）
    ├── styles/         # 全局样式
    └── svgs/           # SVG 资源
```

## 快速开始

```bash
pnpm install
pnpm dev
```

开发服务器默认运行在 http://localhost:2025

## 部署

### Vercel

1. 将本仓库导入 Vercel 创建项目
2. 配置环境变量（见下方）后部署即可

### Cloudflare Workers

```bash
pnpm build:cf    # 构建
pnpm deploy      # 部署
```

## 环境变量

| 变量 | 说明 |
| --- | --- |
| `NEXT_PUBLIC_GITHUB_OWNER` | GitHub 用户名 |
| `NEXT_PUBLIC_GITHUB_REPO` | 内容仓库名 |
| `NEXT_PUBLIC_GITHUB_BRANCH` | 内容分支（默认 `main`） |
| `NEXT_PUBLIC_GITHUB_APP_ID` | GitHub App ID |
| `NEXT_PUBLIC_GITHUB_ENCRYPT_KEY` | 私钥在浏览器缓存时的加密密钥 |
| `BLOG_SLUG_KEY` | 博客 slug 密钥（可选） |

也可以在 `src/consts.ts` 中直接修改默认值。

## 内容管理

本项目的核心是通过 **GitHub App** 管理仓库内容：

1. 在 GitHub Developer Settings 创建一个 GitHub App，授予仓库 **Contents 写权限**
2. 创建 App 的 **Private Key**，获取 **App ID**
3. 将该 App 安装到内容仓库（只授权目标仓库）
4. 配置上述环境变量
5. 在站点各页面右上角点击编辑按钮，填入 Private Key 后即可在线增删改内容

> **安全提示**：Private Key 是仓库的写权限凭证，请妥善保管，切勿上传到公开网络。

## License

[MIT](LICENSE)
