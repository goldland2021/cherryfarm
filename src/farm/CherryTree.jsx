import { useEffect, useState } from 'react';
import { getTelegramUserId } from '../lib/telegram';
import { hasPickedToday, pickCherry } from '../lib/cherryService';

// 通用 Loading Spinner
function LoadingSpinner() {
  return (
    <div style={{
      width: '24px',
      height: '24px',
      border: '3px solid rgba(255,255,255,0.3)',
      borderTopColor: 'white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
  );
}

// 樱桃树状态牌 - 优化版本
function CherryTreeStatus({ picked, adWatched, adPicked }) {
  const statusConfig = {
    notPicked: {
      title: '🍒 每日免费摘取',
      subtitle: '点击下方按钮收获今日樱桃',
      color: '#fecaca',
      bgColor: 'rgba(220, 38, 38, 0.1)',
      borderColor: 'rgba(220, 38, 38, 0.2)'
    },
    pickedNoAd: {
      title: '✅ 今日已摘取',
      subtitle: '观看广告可再摘一次',
      color: '#fde68a',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      borderColor: 'rgba(245, 158, 11, 0.2)'
    },
    adReady: {
      title: '✨ 广告已完成',
      subtitle: '点击下方按钮额外摘一次',
      color: '#86efac',
      bgColor: 'rgba(34, 197, 94, 0.1)',
      borderColor: 'rgba(34, 197, 94, 0.2)'
    },
    completed: {
      title: '🎉 今日樱桃已摘完',
      subtitle: '下次摘取将在24小时后刷新',
      color: '#c4b5fd',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      borderColor: 'rgba(139, 92, 246, 0.2)'
    }
  };

  let status;
  if (!picked) status = 'notPicked';
  else if (picked && !adWatched) status = 'pickedNoAd';
  else if (adWatched && !adPicked) status = 'adReady';
  else status = 'completed';

  const config = statusConfig[status];

  return (
    <div style={{
      marginBottom: '20px',
      padding: '16px',
      borderRadius: '16px',
      backgroundColor: config.bgColor,
      border: `1px solid ${config.borderColor}`,
      textAlign: 'center',
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{ 
        fontSize: '18px', 
        fontWeight: '800', 
        marginBottom: '6px',
        color: config.color,
        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
      }}>{config.title}</div>
      <div style={{ 
        fontSize: '14px', 
        color: '#94a3b8',
        fontWeight: '500'
      }}>{config.subtitle}</div>
    </div>
  );
}

// 摘樱桃按钮 - 优化版本
function CherryButton({ 
  onClick, 
  disabled, 
  label, 
  loading,
  variant = 'primary', // primary, ad, extra
  fullWidth = true 
}) {
  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      shadow: '0 8px 32px rgba(239, 68, 68, 0.4)',
      hoverShadow: '0 12px 48px rgba(239, 68, 68, 0.6)'
    },
    ad: {
      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
      shadow: '0 8px 32px rgba(245, 158, 11, 0.4)',
      hoverShadow: '0 12px 48px rgba(245, 158, 11, 0.6)'
    },
    extra: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      shadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
      hoverShadow: '0 12px 48px rgba(16, 185, 129, 0.6)'
    }
  };

  const styles = variantStyles[variant] || variantStyles.primary;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: fullWidth ? '100%' : 'auto',
        padding: '18px 0',
        borderRadius: '16px',
        border: 'none',
        background: disabled ? 'linear-gradient(135deg, #475569, #64748b)' : styles.background,
        color: '#ffffff',
        fontSize: '18px',
        fontWeight: '700',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : styles.shadow,
        transition: 'all 0.3s ease',
        opacity: disabled ? 0.6 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        letterSpacing: '0.3px'
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = styles.hoverShadow;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = styles.shadow;
        }
      }}
    >
      {loading ? (
        <>
          <LoadingSpinner />
          <span>摘取中...</span>
        </>
      ) : label}
    </button>
  );
}

// 樱桃树组件 - 主要组件
export default function CherryTree() {
  const [userId, setUserId] = useState(null);
  const [picked, setPicked] = useState(false);
  const [adWatched, setAdWatched] = useState(false);
  const [adPicked, setAdPicked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cherryCount, setCherryCount] = useState(428);
  const [watchingAd, setWatchingAd] = useState(false);
  const [level, setLevel] = useState(7);
  const [animating, setAnimating] = useState(false);

  // 获取 Telegram 用户
  useEffect(() => {
    const id = getTelegramUserId();
    setUserId(id);
  }, []);

  // 查询今天是否已摘
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let alive = true;

    async function check() {
      try {
        const result = await hasPickedToday(userId);
        if (alive) setPicked(result);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    }

    check();
    return () => (alive = false);
  }, [userId]);

  // 免费摘取
  const handleFirstPick = async () => {
    if (!userId || picked || loading) return;
    
    setLoading(true);
    setAnimating(true);
    
    try {
      await pickCherry(userId);
      setPicked(true);
      setCherryCount(prev => prev + 1);
      
      // 触发视觉反馈
      setTimeout(() => setAnimating(false), 1000);
    } catch (error) {
      console.error('摘取失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 模拟看广告
  const watchAd = () => {
    if (watchingAd || adWatched) return;
    
    setWatchingAd(true);
    
    // 模拟5秒广告
    setTimeout(() => {
      setWatchingAd(false);
      setAdWatched(true);
    }, 5000);
  };

  // 广告摘取
  const handleAdPick = async () => {
    if (!userId || !adWatched || adPicked || loading) return;
    
    setLoading(true);
    setAnimating(true);
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAdPicked(true);
      setCherryCount(prev => prev + 1);
      
      // 触发视觉反馈
      setTimeout(() => setAnimating(false), 1000);
    } catch (error) {
      console.error('广告摘取失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: 360,
      margin: '0 auto',
      padding: '16px 16px 80px 16px',
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      position: 'relative',
      fontFamily: '"Segoe UI", -apple-system, system-ui, sans-serif',
      color: '#f8fafc',
    }}>
      {/* 顶部状态栏 - 优化 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        borderRadius: '20px',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}>
        {/* 等级徽章 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          padding: '10px 16px',
          borderRadius: '14px',
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '10px',
            color: '#7c3aed',
            fontWeight: 'bold',
            fontSize: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}>{level}</div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
          }}>等级</div>
        </div>

        {/* 樱桃数量展示 - 居中突出显示 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 20px',
            borderRadius: '16px',
            backgroundColor: 'rgba(220, 38, 38, 0.15)',
            border: '2px solid rgba(251, 113, 133, 0.3)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* 背景光效 */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent, rgba(251, 113, 133, 0.1), transparent)',
              animation: 'shine 3s infinite linear',
            }} />
            
            <span style={{ 
              fontSize: '32px', 
              marginRight: '12px',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              animation: animating ? 'bounce 0.5s ease' : 'none'
            }}>🍒</span>
            <span style={{ 
              fontWeight: '900', 
              fontSize: '28px', 
              color: '#fecaca',
              textShadow: '0 2px 8px rgba(0,0,0,0.4)',
              animation: animating ? 'pulse 0.5s ease' : 'none'
            }}>{cherryCount}</span>
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#94a3b8',
            marginTop: '6px',
            fontWeight: '500',
            letterSpacing: '0.5px'
          }}>
            樱桃数量
          </div>
        </div>

        {/* 用户标识 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(148, 163, 184, 0.1)',
          padding: '10px 16px',
          borderRadius: '14px',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#3b82f6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '10px',
            fontWeight: 'bold',
            fontSize: '14px',
          }}>👤</div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600',
            color: '#cbd5e1'
          }}>玩家</div>
        </div>
      </div>

      {/* 樱桃树主区域 */}
      <div style={{
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        borderRadius: '24px',
        padding: '28px',
        marginBottom: '16px',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}>
        {/* 背景装饰光效 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 30%, rgba(251, 113, 133, 0.1) 0%, transparent 70%)',
          zIndex: 0,
        }} />

        {/* 樱桃树动画 */}
        <div style={{
          fontSize: '160px',
          marginBottom: '28px',
          textAlign: 'center',
          filter: (picked && !adWatched) ? 'grayscale(0.4) opacity(0.8)' : 'drop-shadow(0 12px 32px rgba(251, 113, 133, 0.4))',
          transition: 'all 0.3s ease',
          animation: (picked && !adWatched) ? 'none' : 'float 3s ease-in-out infinite',
          position: 'relative',
          zIndex: 1,
        }}>🌳</div>

        {/* 状态牌 */}
        <CherryTreeStatus 
          picked={picked} 
          adWatched={adWatched} 
          adPicked={adPicked} 
        />

        {/* 免费摘取按钮 */}
        <div style={{ marginBottom: (picked && !adPicked) ? '20px' : '0' }}>
          <CherryButton
            onClick={handleFirstPick}
            disabled={!userId || picked || loading}
            loading={loading && !picked}
            label={!userId ? '请在 Telegram 内打开' : (picked ? '✅ 今日已摘取' : '🍒 免费摘取樱桃')}
            variant="primary"
          />
        </div>

        {/* 广告区域 */}
        {picked && !adPicked && (
          <div style={{ 
            marginTop: '24px', 
            paddingTop: '24px', 
            borderTop: '1px solid rgba(148, 163, 184, 0.2)',
            position: 'relative',
            zIndex: 1,
          }}>
            {/* 广告提示 */}
            <div style={{
              marginBottom: '16px',
              textAlign: 'center',
            }}>
              <div style={{ 
                fontSize: '14px', 
                color: '#94a3b8',
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                {!adWatched ? '观看广告获得额外摘取机会' : '广告已完成，获得额外摘取机会'}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}>
                <span>奖励：</span>
                <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>+1樱桃</span>
              </div>
            </div>

            {/* 广告按钮 */}
            {!adWatched ? (
              <CherryButton
                onClick={watchAd}
                disabled={!userId || watchingAd}
                loading={watchingAd}
                label={watchingAd ? '广告播放中...' : '📺 观看广告'}
                variant="ad"
              />
            ) : (
              <CherryButton
                onClick={handleAdPick}
                disabled={!userId || adPicked || loading}
                loading={loading && adWatched}
                label='✨ 额外摘取一次'
                variant="extra"
              />
            )}
          </div>
        )}
      </div>

      {/* 进度提示 */}
      {(picked && !adPicked) && (
        <div style={{
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '20px',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ 
            fontSize: '14px', 
            color: '#94a3b8',
            fontWeight: '500'
          }}>
            今日进度：<span style={{ 
              color: adWatched ? '#10b981' : '#f59e0b',
              fontWeight: 'bold'
            }}>{adWatched ? '已完成' : '进行中'}</span>
          </div>
        </div>
      )}

      {/* 全局动画样式 */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        /* 按钮悬停效果 */
        button:not(:disabled):hover {
          transform: translateY(-2px) !important;
        }
      `}</style>
    </div>
  );
}