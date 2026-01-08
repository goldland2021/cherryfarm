/**
 * Telegram WebApp 工具函数
 */

// 初始化 Telegram WebApp
export function initTelegramWebApp() {
  if (typeof window === 'undefined') return null;
  
  const tg = window.Telegram?.WebApp;
  if (!tg) {
    console.warn('Telegram WebApp not found');
    return null;
  }
  
  // 初始化
  tg.ready();
  tg.expand(); // 展开应用
  
  return tg;
}

// 获取用户信息
export function getTelegramUser() {
  const tg = initTelegramWebApp();
  if (!tg) return null;
  
  const userData = tg.initDataUnsafe?.user;
  if (!userData?.id) return null;
  
  return {
    id: userData.id,
    username: userData.username || `user_${userData.id}`,
    first_name: userData.first_name,
    last_name: userData.last_name,
    language_code: userData.language_code,
    photo_url: userData.photo_url
  };
}

// 检查是否在 Telegram 环境中
export function isInTelegram() {
  return Boolean(window.Telegram?.WebApp);
}

// 发送数据到 Telegram
export function sendDataToTelegram(data) {
  const tg = initTelegramWebApp();
  if (tg && data) {
    tg.sendData(JSON.stringify(data));
  }
}

// 关闭 WebApp
export function closeWebApp() {
  const tg = initTelegramWebApp();
  if (tg) {
    tg.close();
  }
}