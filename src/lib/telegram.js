export function getTelegramWebApp() {
    if (typeof window === 'undefined') return null
    if (!window.Telegram) return null
    if (!window.Telegram.WebApp) return null
    return window.Telegram.WebApp
  }
  
  export function getTelegramUserId() {
    const tg = getTelegramWebApp()
    if (!tg) return null
  
    // 官方初始化
    tg.ready()
  
    return tg.initDataUnsafe?.user?.id ?? null
  }
  