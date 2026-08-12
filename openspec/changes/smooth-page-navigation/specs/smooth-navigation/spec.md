## Purpose

为站内导航提供可感知、连续且可访问的页面切换体验，让用户在等待数据、切换滚动位置和使用持久化工具时始终知道系统正在响应。

## ADDED Requirements

### Requirement: Navigation feedback is immediate

站内页面跳转 MUST 在用户触发导航后立即显示与目标页面结构一致的加载反馈，直到目标内容可交互；等待期间不得出现空白内容区域或无反馈状态。

#### Scenario: Server-rendered page is still loading
- **WHEN** a user navigates to a page whose server data has not completed
- **THEN** the main content area shows a stable loading skeleton or placeholder immediately
- **AND** persistent navigation and music controls remain available

#### Scenario: Loading fails
- **WHEN** the target page cannot load its data
- **THEN** the page shows a readable error state with a retry or recovery action
- **AND** the persistent layout remains usable

### Requirement: Main content transitions smoothly

主内容区域 MUST 使用短时、低幅度的进入/退出过渡完成页面替换；过渡 MUST 不改变 URL、不得遮挡交互控件，并 MUST 尊重用户的 reduced-motion 设置。

#### Scenario: Normal page transition
- **WHEN** navigation changes from one internal page to another
- **THEN** the old main content exits and the new main content enters with a continuous opacity/position transition
- **AND** the navigation card and music player do not visibly reset

#### Scenario: Reduced motion preference
- **WHEN** the user has enabled reduced motion in the operating system or browser
- **THEN** the page transition uses no non-essential movement
- **AND** loading feedback remains understandable through static visual state

### Requirement: Scroll position follows navigation semantics

页面跳转 MUST 根据导航语义管理滚动位置：普通站内页面进入顶部、带锚点的导航定位到目标锚点、浏览器后退/前进恢复历史位置。

#### Scenario: Navigate to a normal page
- **WHEN** a user opens a different internal page without a hash anchor
- **THEN** the new page starts at its top content position

#### Scenario: Navigate to an anchor
- **WHEN** a user opens an internal URL containing a valid hash anchor
- **THEN** the browser positions the target section in view
- **AND** global top-reset behavior does not override the anchor position

#### Scenario: Return to a previous page
- **WHEN** a user uses browser back or forward navigation
- **THEN** the previous page restores its recorded scroll position when available

### Requirement: Persistent UI remains continuous

导航卡片和音乐播放器 MUST 在页面间保持其可观察状态；它们的形态变化 MUST 以连续布局变化呈现，不得因路由切换而丢失音乐播放、当前曲目或用户配置。

#### Scenario: Switch between home and content page
- **WHEN** a user navigates between the home page and another internal page
- **THEN** the navigation card changes to the appropriate layout without an abrupt position or size jump

#### Scenario: Music continues across pages
- **WHEN** a track is playing and the user navigates to another internal page
- **THEN** playback, current track, and progress continue uninterrupted
- **AND** the player remains available in the target page layout

### Requirement: Navigation controls prevent duplicate actions

由按钮触发的内部导航 MUST 在导航请求进行期间提供 pending 状态，并阻止同一控件重复触发，直到导航完成或失败。

#### Scenario: Repeated click during navigation
- **WHEN** a user clicks a navigation button multiple times before the first navigation completes
- **THEN** only one navigation request is processed
- **AND** the control exposes a pending or disabled state
