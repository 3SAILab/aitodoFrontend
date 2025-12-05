// 使用 Web Crypto API 对密码进行 SHA-256 加盐哈希
// 说明：前端哈希仅用于减少明文传输与本地存储风险，不能替代后端的 bcrypt/argon2 等强哈希算法。

const TEXT_ENCODER = new TextEncoder()

// 注意：真实生产环境应使用后端下发或构建时注入的随机盐，这里仅做示例
export const FRONTEND_PASSWORD_SALT = 'frontend-static-salt-v1'

export async function hashPasswordSHA256(password: string, salt: string = FRONTEND_PASSWORD_SALT): Promise<string> {
  const data = TEXT_ENCODER.encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(digest))
  // 转为十六进制字符串
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}



