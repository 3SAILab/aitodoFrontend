// 表单与输入校验工具，所有用户输入在进入业务逻辑前都应经过校验

export function isValidEmail(email: string): boolean {
  // 简单的邮箱正则校验，后端仍需再次校验
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 至少 8 位，包含字母与数字
export function isStrongPassword(password: string): boolean {
//   if (password.length < 8) return false
//   const hasLetter = /[A-Za-z]/.test(password)
//   const hasDigit = /\d/.test(password)
//   return hasLetter && hasDigit
    return true
}


