export function getTelegramUser() {
  if (typeof window === 'undefined') return null

  const tg = window.Telegram?.WebApp
  if (!tg) return null

  tg.ready()

  const user = tg.initDataUnsafe?.user
  if (!user?.id) return null

  return {
    id: user.id,
    username: user.username || null
  }
}
