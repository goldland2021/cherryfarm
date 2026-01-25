// src/components/TgLogin.jsx
import { useState, useEffect } from 'react';

// 通用Telegram登录组件：抽离登录核心逻辑，支持全局复用
// children：登录成功后要渲染的业务组件
export default function TgLogin({ children }) {
  // 登录核心状态：与原代码一致，仅负责登录相关状态管理
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState(''); // 新增登录错误状态，统一错误处理

  // 登录初始化逻辑：仅保留Telegram环境校验和用户信息获取（原FarmScene的登录逻辑）
  useEffect(() => {
    const initTgLogin = async () => {
      try {
        setLoginError(''); // 重置错误状态
        // 1. Telegram环境校验（与原代码一致）
        const tg = window.Telegram?.WebApp;
        if (!tg) throw new Error('未检测到Telegram环境，请在Telegram中打开');
        if (!tg.initDataUnsafe?.user) throw new Error('Telegram用户信息获取失败，请重新进入');
        
        // 2. 封装并存储Telegram用户信息（与原代码一致）
        const telegramUser = {
          id: tg.initDataUnsafe.user.id,
          username: tg.initDataUnsafe.user.username || '未知用户'
        };
        setUser(telegramUser);
      } catch (error) {
        // 统一捕获登录错误，存储错误信息（替代原alert，更灵活）
        setLoginError(error.message);
        console.error('Telegram登录失败：', error);
      } finally {
        // 无论成功/失败，结束登录加载状态
        setIsLoading(false);
      }
    };

    initTgLogin();
  }, []); // 空依赖，仅组件挂载时执行一次登录逻辑

  // 登录加载中：统一的加载占位（可全局复用）
  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        color: '#e5e7eb'
      }}>
        Telegram登录中...
      </div>
    );
  }

  // 登录失败：展示错误信息（替代原alert，体验更优）
  if (loginError) {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        color: '#f87171',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h3>登录失败</h3>
        <p>{loginError}</p>
        <p style={{ marginTop: '20px', color: '#e5e7eb' }}>请关闭页面后重新打开</p>
      </div>
    );
  }

  // 登录成功：通过children插槽渲染业务组件，并透传登录状态（user + isLoading）
  // 这里的isLoading始终为false，透传是为了业务组件统一使用
  return children({ user, isLoading: false });
}