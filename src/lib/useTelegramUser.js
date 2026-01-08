import { useState, useEffect } from 'react';

/**
 * React 自定义钩子：获取 Telegram Mini App 用户信息
 * @returns { {user: {id: number, username: string} | null, isLoading: boolean} }
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

        // 初始化 Telegram Mini App
        tg.ready();
        tg.expand(); // 全屏显示

        // 获取用户信息（确保 Mini App 配置了允许获取用户信息）
        const tgUser = tg.initDataUnsafe?.user;
        if (!tgUser?.id) {
          throw new Error('无法获取 Telegram 用户ID，请授权后重试');
        }

        // 存储用户核心信息
        setUser({
          id: tgUser.id,
          username: tgUser.username || '樱桃农场主'
        });
      } catch (error) {
        console.error('获取 Telegram 用户信息失败:', error);
        alert(`⚠️ ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    initTelegram();

    // 组件卸载时的清理函数
    return () => {
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.disableVerticalSwipes(); // 禁用滑动关闭（可选）
      }
    };
  }, []);

  return { user, isLoading };
}