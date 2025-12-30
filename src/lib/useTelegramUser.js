export function getTelegramUserId() {
  if (!window.Telegram?.WebApp) return null
  return window.Telegram.WebApp.initDataUnsafe?.user?.id ?? null
}
