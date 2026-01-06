import { useEffect, useState, useCallback } from 'react';
import { getTelegramUserId } from '../lib/telegram';
import { hasPickedToday, pickCherry } from '../lib/cherryService';
import { theme } from '../styles/theme';

// 通用 Loading Spinner
function LoadingSpinner() {
  return (
    <div
      style={{
        width: '24px',
        height: '24px',
        border: '3px solid rgba(255,255,255,0.3)',
        borderTopColor: 'white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    />
  );
}

// 樱桃树状态牌
function CherryTreeStatus({ picked, adWatched, adPicked }) {
  const getStatus = () => {
    if (!picked) return theme.colors.status.notPicked;
    if (picked && !adWatched) return theme.colors.status.pickedNoAd;
    if (adWatched && !adPicked) return theme.colors.status.adReady;
    return theme.colors.status.completed;
  };

  const status = getStatus();

  return (
    <div
      style={{
        marginBottom: '20px',
        padding: '16px',
        borderRadius: theme.radius.md,
        backgroundColor: status.bg,
        border: `1px solid ${status.border}`,
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        style={{
          fontSize: '18px',
          fontWeight: '800',
          marginBottom: '6px',
          color: status.color,
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        }}
      >
        {status === theme.colors.status.notPicked && '🍒 每日免费摘取'}
        {status === theme.colors.status.pickedNoAd && '✅ 今日已摘取'}
        {status === theme.colors.status.adReady && '✨ 广告已完成'}
        {status === theme.colors.status.completed && '🎉 今日樱桃已摘完'}
      </div>
      <div
        style={{
          fontSize: '14px',
          color: theme.colors.textMuted,
          fontWeight: '500',
        }}
      >
        {status === theme.colors.status.notPicked && '点击下方按钮收获今日樱桃'}
        {status === theme.colors.status.pickedNoAd && '观看广告可再摘一次'}
        {status === theme.colors.status.adReady && '点击下方按钮额外摘一次'}
        {status === theme.colors.status.completed && '下次摘取将在24小时后刷新'}
      </div>
    </div>
  );
}

// 通用樱桃按钮
function CherryButton({
  onClick,
  disabled = false,
  loading = false,
  label,
  variant = 'primary', // primary | ad | extra
  fullWidth = true,
}) {
  const variants = {
    primary: {
      bg: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDark})`,
      shadow: theme.shadow.button,
      hoverShadow: theme.shadow.buttonHover,
    },
    ad: {
      bg: `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.accentDark})`,
      shadow: theme.shadow.buttonAccent,
      hoverShadow: theme.shadow.buttonAccentHover,
    },
    extra: {
      bg: `linear-gradient(135deg, ${theme.colors.success}, ${theme.colors.successDark})`,
      shadow: theme.shadow.buttonSuccess,
      hoverShadow: theme.shadow.buttonSuccessHover,
    },
  };

  const style = variants[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        width: fullWidth ? '100%' : 'auto',
        padding: '18px 0',
        borderRadius: theme.radius.md,
        border: 'none',
        background: disabled || loading ? 'linear-gradient(135deg, #475569, #64748b)' : style.bg,
        color: '#ffffff',
        fontSize: '18px',
        fontWeight: '700',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        boxShadow: disabled || loading ? 'none' : style.shadow,
        transition: 'all 0.3s ease',
        opacity: disabled || loading ? 0.6 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        letterSpacing: '0.3px',
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = style.hoverShadow;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = style.shadow;
        }
      }}
    >
      {loading ? (
        <>
          <LoadingSpinner />
          <span>摘取中...</span>
        </>
      ) : (
        label
      )}
    </button>
  );
}

// 主组件
export default function CherryTree() {
  const [userId, setUserId] = useState(null);
  const [picked, setPicked] = useState(false);
  const [adWatched, setAdWatched] = useState(false);
  const [adPicked, setAdPicked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cherryCount, setCherryCount] = useState(428); // 实际项目建议从后端获取
  const [watchingAd, setWatchingAd] = useState(false);
  const [level, setLevel] = useState(7);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const id = getTelegramUserId();
    setUserId(id);
  }, []);

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

  const handleFirstPick = async () => {
    if (!userId || picked || loading) return;

    setLoading(true);
    setAnimating(true);

    try {
      await pickCherry(userId);
      setPicked(true);
      setCherryCount((prev) => prev + 1);
      setTimeout(() => setAnimating(false), 1000);
    } catch (error) {
      console.error('摘取失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const watchAd = () => {
    if (watchingAd || adWatched) return;
    setWatchingAd(true);

    // 模拟5秒广告
    setTimeout(() => {
      setWatchingAd(false);
      setAdWatched(true);
    }, 5000);
  };

  const handleAdPick = async () => {
    if (!userId || !adWatched || adPicked || loading) return;

    setLoading(true);
    setAnimating(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAdPicked(true);
      setCherryCount((prev) => prev + 1);
      setTimeout(() => setAnimating(false), 1000);
    } catch (error) {
      console.error('广告摘取失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 360,
        margin: '0 auto',
        padding: '16px 16px 80px',
        minHeight: '100vh',
        background: theme.colors.backgroundGradient,
        fontFamily: '"Segoe UI", -apple-system, system-ui, sans-serif',
        color: theme.colors.textPrimary,
      }}
    >
      {/* 顶部状态栏 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.lg,
          border: `1px solid ${theme.colors.cardBorder}`,
          backdropFilter: 'blur(10px)',
          boxShadow: theme.shadow.card,
        }}
      >
        {/* 等级徽章 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: `linear-gradient(135deg, ${theme.colors.purple}, #7c3aed)`,
            padding: '10px 16px',
            borderRadius: theme.radius.md,
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
          }}
        >
          <div
            style={{
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
            }}
          >
            {level}
          </div>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>等级</div>
        </div>

        {/* 樱桃数量 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 20px',
              borderRadius: theme.radius.md,
              backgroundColor: 'rgba(220, 38, 38, 0.15)',
              border: '2px solid rgba(251, 113, 133, 0.3)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, transparent, rgba(251, 113, 133, 0.1), transparent)',
                animation: theme.animation.shine,
              }}
            />
            <span
              style={{
                fontSize: '32px',
                marginRight: '12px',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                animation: animating ? theme.animation.bounce : 'none',
              }}
            >
              🍒
            </span>
            <span
              style={{
                fontWeight: '900',
                fontSize: '28px',
                color: '#fecaca',
                textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                animation: animating ? theme.animation.pulse : 'none',
              }}
            >
              {cherryCount}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: theme.colors.textMuted, marginTop: '6px' }}>
            樱桃数量
          </div>
        </div>

        {/* 用户标识 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(148, 163, 184, 0.1)',
            padding: '10px 16px',
            borderRadius: theme.radius.md,
          }}
        >
          <div
            style={{
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
            }}
          >
            👤
          </div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textSecondary }}>
            玩家
          </div>
        </div>
      </div>

      {/* 主卡片区域 */}
      <div
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.xl,
          padding: '28px',
          marginBottom: '16px',
          border: `1px solid ${theme.colors.cardBorder}`,
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)',
          boxShadow: theme.shadow.card,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 30%, rgba(251, 113, 133, 0.1) 0%, transparent 70%)',
          }}
        />

        {/* 樱桃树 */}
        <div
          style={{
            fontSize: '160px',
            marginBottom: '28px',
            textAlign: 'center',
            filter:
              picked && !adWatched
                ? 'grayscale(0.4) opacity(0.8)'
                : 'drop-shadow(0 12px 32px rgba(251, 113, 133, 0.4))',
            transition: 'all 0.3s ease',
            animation:
              picked && !adWatched ? 'none' : theme.animation.float,
            position: 'relative',
            zIndex: 1,
          }}
        >
          🌳
        </div>

        <CherryTreeStatus picked={picked} adWatched={adWatched} adPicked={adPicked} />

        {/* 免费摘取按钮 */}
        <div style={{ marginBottom: picked && !adPicked ? '20px' : '0' }}>
          <CherryButton
            onClick={handleFirstPick}
            disabled={!userId || picked || loading}
            loading={loading && !adWatched}
            label={
              !userId
                ? '请在 Telegram 内打开'
                : picked
                ? '✅ 今日已摘取'
                : '🍒 免费摘取樱桃'
            }
            variant="primary"
          />
        </div>

        {/* 广告区域 */}
        {picked && !adPicked && (
          <div
            style={{
              marginTop: '24px',
              paddingTop: '24px',
              borderTop: `1px solid ${theme.colors.cardBorder}`,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: theme.colors.textMuted, marginBottom: '8px' }}>
                {!adWatched ? '观看广告获得额外摘取机会' : '广告已完成，获得额外摘取机会'}
              </div>
              <div style={{ fontSize: '12px', color: theme.colors.textDisabled, display: 'flex', justifyContent: 'center', gap: '4px' }}>
                <span>奖励：</span>
                <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>+1樱桃</span>
              </div>
            </div>

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
                label="✨ 额外摘取一次"
                variant="extra"
              />
            )}
          </div>
        )}
      </div>

      {/* 进度提示 */}
      {(picked && !adPicked) && (
        <div
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: theme.radius.md,
            padding: '16px',
            marginBottom: '20px',
            border: `1px solid ${theme.colors.cardBorder}`,
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ fontSize: '14px', color: theme.colors.textMuted }}>
            今日进度：
            <span style={{ color: adWatched ? theme.colors.success : theme.colors.accent, fontWeight: 'bold' }}>
              {adWatched ? ' 已完成' : ' 进行中'}
            </span>
          </div>
        </div>
      )}

      {/* 全局动画 */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
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
      `}</style>
    </div>
  );
}