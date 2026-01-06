// src/lib/useTelegramUser.js
export async function getOrCreateUser() {
  if (typeof window === 'undefined') return null
  const tg = window.Telegram?.WebApp
  if (!tg) return null

  tg.ready()

  const userId = tg.initDataUnsafe?.user?.id
  if (!userId) return null

  return { id: userId }
}
