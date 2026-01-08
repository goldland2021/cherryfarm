import { useState, useEffect } from 'react'

/**
 * 获取 Telegram 用户信息的 Hook
 */
export function useTelegramUser() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // 确保在客户端执行
    if (typeof window === 'undefined') return

    const tg = window.Telegram?.WebApp
    if (!tg) {
      console.warn('Telegram WebApp not found')
      return
    }

    // 初始化 Telegram WebApp
    tg.ready()
    tg.expand()  // 建议展开应用以使用全屏

    const userData = tg.initDataUnsafe?.user
    if (userData?.id) {
      setUser({
        id: userData.id,
        username: userData.username || `用户${userData.id}`
      })
    }
  }, [])

  return user
}