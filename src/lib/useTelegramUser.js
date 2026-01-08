import { useState, useEffect } from 'react'
import { getTelegramUser, isInTelegram } from './telegram'

/**
 * 自定义 Hook: 获取 Telegram 用户信息
 */
export function useTelegramUser() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInTelegramEnv, setIsInTelegramEnv] = useState(false)

  useEffect(() => {
    const checkTelegram = async () => {
      setIsLoading(true)
      
      // 检查是否在 Telegram 环境中
      const inTelegram = isInTelegram()
      setIsInTelegramEnv(inTelegram)

      if (inTelegram) {
        // 如果在 Telegram 中，获取用户信息
        const tgUser = getTelegramUser()
        setUser(tgUser)
      } else {
        // 不在 Telegram 中，设置模拟用户用于开发
        setUser(getMockUser())
      }

      setIsLoading(false)
    }

    checkTelegram()
  }, [])

  return {
    user,
    isLoading,
    isInTelegramEnv,
    isAuthenticated: !!user
  }
}

// 开发环境模拟用户
function getMockUser() {
  if (import.meta.env.DEV) {
    return {
      id: Math.floor(Math.random() * 1000000),
      username: `dev_user_${Math.floor(Math.random() * 1000)}`,
      first_name: 'Development',
      last_name: 'User',
      language_code: 'en'
    }
  }
  return null
}