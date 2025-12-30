export function getTelegramUserId() {
    if (!window.Telegram) return null
    if (!window.Telegram.WebApp) return null
  
    const user = window.Telegram.WebApp.initDataUnsafe?.user
    return user?.id ?? null
  }
  