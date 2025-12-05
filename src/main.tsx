// src/main.tsx
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import './index.css'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { bootstrapAuthSession } from '@/utils/authToken'

// 在应用启动时基于 HttpOnly refreshToken 自动恢复登录态
const AuthBootstrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        await bootstrapAuthSession()
      } finally {
        if (!cancelled) {
          setReady(true)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  if (!ready) {
    // 这里可以替换为更友好的全局 Skeleton / Loading
    return <div className="flex h-screen items-center justify-center">正在加载会话...</div>
  }

  return <>{children}</>
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastContainer
      position="top-center"
      autoClose={2000}
      hideProgressBar={true}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
    <AuthBootstrap>
      <RouterProvider router={router} />
    </AuthBootstrap>
  </React.StrictMode>
)
