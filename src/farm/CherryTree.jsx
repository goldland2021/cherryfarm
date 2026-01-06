// farm/CherryTree.jsx
import { useEffect, useState } from 'react';
import { getTelegramUserId } from '../lib/telegram';
import { hasPickedToday, pickCherry } from '../lib/cherryService';

// 通用 Loading Spinner
function LoadingSpinner() {
  return (
    <div style={{
      width: '20px',
      height: '20px',
      border: '3px solid rgba(255,255,255,0.3)',
      borderTopColor: 'white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
  );
}

// 樱桃树状态牌
function CherryTreeStatus({ picked, adWatched, adPicked }) {
  let title = '';
  let subtitle = '';

  if (!picked) {
    title = '🍒 每日免费摘取';
    subtitle = '点击下方按钮收获今日樱桃';
  } else if (picked && !adWatched) {
    title = '🍒 今日已摘取';
    subtitle = '观看广告可再摘一次';
  } else if (adWatched && !adPicked) {
    title = '✅ 广告已完成';
    subtitle = '点击下方按钮额外摘一次';
  } else {
    title = '🎉 今日樱桃已摘完！';
    subtitle = '下次摘取将在24小时后刷新';
  }

  return (
    <div style={{
      marginBottom: '24px',
      padding: '14px',
      borderRadius: '14px',
      backgroundColor: 'rgba(30, 41, 59, 0.9)',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      textAlign: 'center',
      color: '#f8fafc',
    }}>
      <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '14px', color: '#94a3b8' }}>{subtitle}</div>
    </div>
  );
}

// 摘樱桃按钮
function CherryButton({ onClick, disabled, label, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '20px 0',
        borderRadius: '18px',
        border: 'none',
        background: disabled ? 'linear-gradient(135deg, #475569, #64748b)' : 'linear-gradient(135deg, #dc2626, #b91c1c)',
        color: '#ffffff',
        fontSize: '20px',
        fontWeight: '800',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '0 8px 32px rgba(220, 38, 38, 0.5)',
        transition: 'all 0.3s ease',
      }}
    >
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <LoadingSpinner /> 摘取中...
        </div>
      ) : label}
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
    await pickCherry(userId);
    setPicked(true);
    setLoading(false);
    setCherryCount(prev => prev + 1);
  };

  // 模拟看广告
  const watchAd = () => {
    if (watchingAd || adWatched) return;
    setWatchingAd(true);
    setTimeout(() => {
      setWatchingAd(false);
      setAdWatched(true);
    }, 5000);
  };

  // 广告摘取
  const handleAdPick = () => {
    if (!userId || !adWatched || adPicked || loading) return;
    setLoading(true);
    setTimeout(() => {
      setAdPicked(true);
      setLoading(false);
      setCherryCount(prev => prev + 1);
    }, 1000);
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
      {/* 顶部状态栏 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '12px 16px',
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        borderRadius: '16px',
        border: '1px solid rgba(148, 163, 184, 0.1)',
      }}>
        {/* Level */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          padding: '8px 12px',
          borderRadius: '12px',
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '8px',
            color: '#7c3aed',
            fontWeight: 'bold',
            fontSize: '14px',
          }}>{level}</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Level</div>
        </div>

        {/* 樱桃数量 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '6px 16px',
            borderRadius: '12px',
            backgroundColor: 'rgba(220, 38, 38, 0.15)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
          }}>
            <span style={{ fontSize: '28px', marginRight: '8px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>🍒</span>
            <span style={{ fontWeight: '800', fontSize: '24px', color: '#fecaca' }}>{cherryCount}</span>
          </div>
        </div>
      </div>

      {/* 樱桃树区域 */}
      <div style={{
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '16px',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          fontSize: '160px',
          marginBottom: '24px',
          textAlign: 'center',
          filter: picked && !adWatched ? 'grayscale(0.5) opacity(0.7)' : 'drop-shadow(0 8px 24px rgba(251, 113, 133, 0.3))',
          transition: 'all 0.3s ease',
          animation: (picked && !adWatched) ? 'none' : 'float 3s ease-in-out infinite',
        }}>🌳</div>

        {/* 状态牌 */}
        <CherryTreeStatus picked={picked} adWatched={adWatched} adPicked={adPicked} />

        {/* 免费摘取按钮 */}
        <div style={{ marginBottom: adWatched && !adPicked ? '20px' : '0' }}>
          <CherryButton
            onClick={handleFirstPick}
            disabled={!userId || picked || loading}
            loading={loading && !picked}
            label={!userId ? '请在 Telegram 内打开' : (picked ? '✅ 今日已摘取' : '🍒 免费摘取樱桃')}
          />
        </div>

        {/* 广告按钮 */}
        {picked && !adPicked && (
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(148, 163, 184, 0.2)' }}>
            {!adWatched && (
              <CherryButton
                onClick={watchAd}
                disabled={!userId || watchingAd}
                loading={watchingAd}
                label={watchingAd ? '广告播放中...' : '🎬 观看广告 (+1樱桃)'}
              />
            )}
            {adWatched && (
              <CherryButton
                onClick={handleAdPick}
                disabled={!userId || adPicked || loading}
                loading={loading && adWatched}
                label='🍒 额外摘取一次'
              />
            )}
          </div>
        )}
      </div>

      {/* 全局动画样式 */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
