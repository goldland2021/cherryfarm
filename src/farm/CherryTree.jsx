import { useEffect, useState } from 'react';
import { getTelegramUserId } from '../lib/telegram';
import { hasPickedToday, pickCherry } from '../lib/cherryService';
import { theme } from '../styles/theme';

// Loading Spinner（保持不变）
function LoadingSpinner() {
  return (
    <div style={{
      width: '24px',
      height: '24px',
      border: '3px solid rgba(255,255,255,0.3)',
      borderTopColor: 'white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }} />
  );
}

// 状态卡片（更柔和的圆角和阴影）
function CherryTreeStatus({ picked, adWatched, adPicked }) {
  const getStatus = () => {
    if (!picked) return { title: '🍒 每日免费摘取', subtitle: '点击下方按钮收获今日樱桃', ...theme.colors.status.notPicked };
    if (picked && !adWatched) return { title: '✅ 今日已摘取', subtitle: '观看广告可再摘一次', ...theme.colors.status.pickedNoAd };
    if (adWatched && !adPicked) return { title: '✨ 广告已完成', subtitle: '点击下方按钮额外摘一次', ...theme.colors.status.adReady };
    return { title: '🎉 今日樱桃已摘完', subtitle: '下次摘取将在24小时后刷新', ...theme.colors.status.completed };
  };

  const { title, subtitle, color, bg, border } = getStatus();

  return (
    <div style={{
      margin: '20px 0',
      padding: '20px',
      borderRadius: theme.radius.lg,
      backgroundColor: bg,
      border: `1px solid ${border}`,
      textAlign: 'center',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    }}>
      <div style={{ fontSize: '20px', fontWeight: '800', color, marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '15px', color: theme.colors.textMuted }}>{subtitle}</div>
    </div>
  );
}

// 按钮组件（更大、更圆润）
function CherryButton({ onClick, disabled = false, loading = false, label, variant = 'primary' }) {
  const variants = {
    primary: { bg: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDark})`, shadow: theme.shadow.buttonHover },
    ad: { bg: `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.accentDark})`, shadow: theme.shadow.buttonAccentHover },
    extra: { bg: `linear-gradient(135deg, ${theme.colors.success}, ${theme.colors.successDark})`, shadow: theme.shadow.buttonSuccessHover },
  };

  const style = variants[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        width: '100%',
        padding: '20px 0',
        borderRadius: '24px',
        border: 'none',
        background: disabled || loading ? '#475569' : style.bg,
        color: '#fff',
        fontSize: '19px',
        fontWeight: '800',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        boxShadow: disabled || loading ? 'none' : style.shadow,
        transition: 'all 0.4s ease',
        opacity: disabled || loading ? 0.7 : 1,
      }}
    >
      {loading ? <> <LoadingSpinner /> 摘取中...</> : label}
    </button>
  );
}

export default function CherryTree() {
  const [userId, setUserId] = useState(null);
  const [picked, setPicked] = useState(false);
  const [adWatched, setAdWatched] = useState(false);
  const [adPicked, setAdPicked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cherryCount, setCherryCount] = useState(428);
  const [watchingAd, setWatchingAd] = useState(false);
  const [level, setLevel] = useState(7);
  const [showCherryRain, setShowCherryRain] = useState(false); // 新增：摘取成功樱桃雨动画

  // ...（useEffect 和 handle 函数保持不变，略）

  const triggerCherryRain = () => {
    setShowCherryRain(true);
    setTimeout(() => setShowCherryRain(false), 2000);
  };

  // 在成功摘取后调用 triggerCherryRain()
  // 示例：在 handleFirstPick 和 handleAdPick 的成功后添加 triggerCherryRain();

  return (
    <div style={{
      maxWidth: '400px',
      margin: '0 auto',
      padding: '20px 16px 100px',
      minHeight: '100vh',
      background: theme.colors.backgroundGradient,
      position: 'relative',
      overflow: 'hidden',
      color: theme.colors.textPrimary,
    }}>
      {/* 樱桃雨粒子效果（摘取成功时显示） */}
      {showCherryRain && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'none', zIndex: 10 }}>
          {[...Array(12)].map((_, i) => (
            <span key={i} style={{
              position: 'absolute',
              fontSize: '32px',
              left: `${Math.random() * 100}%`,
              animation: `fall ${1 + Math.random() * 1}s linear forwards`,
              animationDelay: `${i * 0.1}s`,
            }}>🍒</span>
          ))}
        </div>
      )}

      {/* 顶部信息栏 - 更紧凑可爱 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        padding: '16px 20px',
        background: theme.colors.card,
        borderRadius: theme.radius.xl,
        boxShadow: theme.shadow.card,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: theme.colors.textMuted }}>等级</div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: theme.colors.purple }}>{level}</div>
        </div>

        <div style={{ textAlign: 'center', position: 'relative' }}>
          <div style={{
            fontSize: '48px',
            animation: showCherryRain ? theme.animation.bounce : 'none',
          }}>🍒</div>
          <div style={{
            fontSize: '36px',
            fontWeight: '900',
            color: '#ff6b6b',
            textShadow: '0 0 20px rgba(255,107,107,0.5)',
            marginTop: '-12px',
          }}>{cherryCount}</div>
          <div style={{ fontSize: '13px', color: theme.colors.textMuted }}>我的樱桃</div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
            👤
          </div>
          <div style={{ fontSize: '13px', color: theme.colors.textMuted, marginTop: '4px' }}>玩家</div>
        </div>
      </div>

      {/* 主樱桃树区域 - 更大更突出 */}
      <div style={{
        background: theme.colors.card,
        borderRadius: theme.radius.xl,
        padding: '40px 20px',
        textAlign: 'center',
        boxShadow: theme.shadow.card,
        backdropFilter: 'blur(12px)',
        position: 'relative',
      }}>
        <div style={{
          fontSize: '200px',
          marginBottom: '20px',
          animation: picked && !adWatched ? 'none' : theme.animation.float,
          filter: picked && !adWatched ? 'grayscale(0.5) opacity(0.8)' : 'drop-shadow(0 20px 40px rgba(255,107,107,0.4))',
        }}>🌸🌳</div> {/* 用樱花+树，更可爱 */}

        <CherryTreeStatus picked={picked} adWatched={adWatched} adPicked={adPicked} />

        {/* 按钮区域 */}
        <div style={{ marginTop: '10px' }}>
          <CherryButton
            onClick={handleFirstPick}
            disabled={!userId || picked || loading}
            loading={loading}
            label={!userId ? '请在 Telegram 内打开' : picked ? '✅ 今日已摘取' : '🍒 免费摘取樱桃 +1'}
            variant="primary"
          />

          {picked && !adPicked && (
            <div style={{ marginTop: '20px' }}>
              {!adWatched ? (
                <CherryButton onClick={watchAd} loading={watchingAd} label="📺 观看广告得额外机会" variant="ad" />
              ) : (
                <CherryButton onClick={handleAdPick} loading={loading} label="✨ 额外摘取一次 +1" variant="extra" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* 全局动画样式 */}
      <style jsx>{`
        @keyframes fall {
          to { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes bounce { 0%,100% { transform: scale(1); } 50% { transform: scale(1.3); } }
      `}</style>
    </div>
  );
}