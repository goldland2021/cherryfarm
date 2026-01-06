// src/styles/theme.js

export const theme = {
    colors: {
      // 主色调
      primary: '#ef4444',       // 红色 - 免费摘取按钮
      primaryDark: '#dc2626',
      accent: '#f59e0b',        // 橙色 - 广告按钮
      accentDark: '#d97706',
      success: '#10b981',       // 绿色 - 额外摘取按钮
      successDark: '#059669',
      purple: '#8b5cf6',        // 等级徽章
  
      // 文字颜色
      textPrimary: '#f8fafc',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
      textDisabled: '#64748b',
  
      // 背景色
      background: '#0f172a',
      backgroundGradient: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      card: 'rgba(30, 41, 59, 0.8)',
      cardBorder: 'rgba(148, 163, 184, 0.1)',
  
      // 状态卡片颜色
      status: {
        notPicked: { color: '#fecaca', bg: 'rgba(220, 38, 38, 0.1)', border: 'rgba(220, 38, 38, 0.2)' },
        pickedNoAd: { color: '#fde68a', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)' },
        adReady: { color: '#86efac', bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.2)' },
        completed: { color: '#c4b5fd', bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.2)' },
      },
    },
  
    radius: {
      sm: '12px',
      md: '16px',
      lg: '20px',
      xl: '24px',
    },
  
    shadow: {
      card: '0 8px 32px rgba(0, 0, 0, 0.4)',
      button: '0 8px 32px rgba(239, 68, 68, 0.4)',
      buttonHover: '0 12px 48px rgba(239, 68, 68, 0.6)',
      buttonAccent: '0 8px 32px rgba(245, 158, 11, 0.4)',
      buttonAccentHover: '0 12px 48px rgba(245, 158, 11, 0.6)',
      buttonSuccess: '0 8px 32px rgba(16, 185, 129, 0.4)',
      buttonSuccessHover: '0 12px 48px rgba(16, 185, 129, 0.6)',
    },
  
    animation: {
      float: 'float 3s ease-in-out infinite',
      shine: 'shine 3s infinite linear',
      bounce: 'bounce 0.5s ease',
      pulse: 'pulse 0.5s ease',
    },
  };
  
  export default theme;