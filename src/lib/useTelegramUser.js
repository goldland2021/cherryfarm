export function getTelegramUserId() {
  // 确保 Telegram WebApp 已初始化
  if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp
    
    // 先初始化
    tg.ready()
    tg.expand() // 展开WebApp以获得更多空间
    
    // 获取用户信息
    const user = tg.initDataUnsafe?.user
    
    if (user && user.id) {
      return user.id.toString() // 转换为字符串
    } else {
      // 尝试从 initData 中解析
      const initData = tg.initData
      if (initData) {
        console.log('initData available:', initData)
        // 这里可以添加解析 initData 的逻辑
        // initData 是一个查询字符串，包含用户信息
      }
    }
  }
  
  console.warn('Telegram WebApp not available')
  return null
}