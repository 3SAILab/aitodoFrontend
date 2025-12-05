// 单元测试示例（建议使用 Vitest 或 Jest 运行）
// 运行前需在 package.json 中配置 test 脚本并安装测试依赖。
//
// 以 Vitest 为例：
//   npm install -D vitest @vitest/ui jsdom
//   在 package.json 中添加:
//     "test": "vitest"

import { describe, expect, it } from 'vitest'
import { FRONTEND_PASSWORD_SALT, hashPasswordSHA256 } from '../crypto'

describe('hashPasswordSHA256', () => {
  it('同样的密码和盐应产生稳定且相同的哈希', async () => {
    const password = 'Password123'
    const hash1 = await hashPasswordSHA256(password, FRONTEND_PASSWORD_SALT)
    const hash2 = await hashPasswordSHA256(password, FRONTEND_PASSWORD_SALT)
    expect(hash1).toBe(hash2)
    expect(hash1).toHaveLength(64) // SHA-256 十六进制长度为 64
  })

  it('不同密码应产生不同的哈希', async () => {
    const hash1 = await hashPasswordSHA256('Password123', FRONTEND_PASSWORD_SALT)
    const hash2 = await hashPasswordSHA256('Password456', FRONTEND_PASSWORD_SALT)
    expect(hash1).not.toBe(hash2)
  })
})



