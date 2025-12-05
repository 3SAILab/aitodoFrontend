// CSRF Token 读取工具
// 推荐后端通过 Set-Cookie + 页面模板 meta 注入，此处优先从 meta 中读取

export function getCsrfToken(): string | null {
  // 1. 从 <meta name="csrf-token" content="..."> 读取
  const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
  if (meta?.content) {
    return meta.content
  }

  // 2. 为了减少持久化风险，这里不再从 localStorage 读取
  // 如需从 Cookie 读取，可在后端通过 Set-Cookie 下发，然后在此解析 document.cookie
  return null
}


