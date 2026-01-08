import { useState, useEffect } from 'react';

/**
 * React 自定义钩子：获取 Telegram Mini App 用户信息
 * @returns { {id: number, username: string} | null } Telegram 用户信息（null 表示未获取到）
 */
export function useTelegramUser() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 初始化 Telegram Mini App
    const initTelegram = async () => {
      try {
        if (typeof window === 'undefined') return;
        
        const tg = window.Telegram?.WebApp;
        if (!tg) {
          throw new Error('未检测到 Telegram Mini App 环境');
        }

        // 仅调用一次 ready() 初始化
        tg.ready();
        // 适配 Telegram 样式
        tg.expand();

        // 获取用户信息（initDataUnsafe 需确保 Mini App 配置了允许获取用户信息）
        const tgUser = tg.initDataUnsafe?.user;
        if (!tgUser?.id) {
          throw new Error('无法获取 Telegram 用户ID，请授权后重试');
        }

        setUser({
          id: tgUser.id,
          username: tgUser.username || '未知用户'
        });
      } catch (error) {
        console.error('获取 Telegram 用户信息失败:', error);
        alert(`用户信息加载失败：${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    initTelegram();

    // 清理函数：处理 Telegram Mini App 生命周期
    return () => {
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.close(); // 可选：组件卸载时关闭 Mini App
      }
    };
  }, []);

  return { user, isLoading };
}