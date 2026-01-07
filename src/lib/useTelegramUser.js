// 获取 Telegram 用户信息
export function useTelegramUser() {
  const getUser = () => {
    if (typeof window === 'undefined') return null
    const tg = window.Telegram?.WebApp
    if (!tg) return null

    tg.ready()

    const id = tg.initDataUnsafe?.user?.id
    const username = tg.initDataUnsafe?.user?.username
    if (!id) return null
    return { id, username }
  }

  return getUser()
}
