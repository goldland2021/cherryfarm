import { useEffect, useState } from 'react'
import { getTelegramUserId } from '../lib/telegram'
import { hasPickedToday, pickCherry } from '../lib/cherryService'

// Loading Spinner 组件
function LoadingSpinner({ size = 20 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: '3px solid rgba(255,255,255,0.3)',
        borderTopColor: 'white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    ></div>
  )
}

// 通用按钮组件
function GradientButton({ children, gradient, disabled, loading, onClick, style = {} }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        width: '100%',
        padding: '18px 0',
        borderRadius: '16px',
        border: 'none',
        background: disabled ? 'linear-gradient(135deg, #475569, #64748b)' : gradient,
        color: '#ffffff',
        fontSize: '18px',
        fontWeight: '800',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '0 8px 32px rgba(0,0,0,0.3)',
        transition: 'all 0.2s ease',
        ...style,
      }}
    >
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
          <LoadingSpinner size={20} />
          {children || '加载中...'}
        </div>
      ) : (
        children
      )}
    </button>
  )
}

export default function CherryTree() {
  // 用户状态
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)

  // 游戏状态
  const [coins, setCoins] = useState(2480)
  const [level, setLevel] = useState(7)
  const [cherryCount, setCherryCount] = useState(428)

  // 摘樱桃状态
  const [picked, setPicked] = useState(false)
  const [adPicked, setAdPicked] = useState(false)

  // 广告状态
  const [adWatched, setAdWatched] = useState(false)
  const [watchingAd, setWatchingAd] = useState(false)

  // ---------------------------
  // 初始化用户信息 & 查询今日摘取状态
  // ---------------------------
  useEffect(() => {
    const uid = getTelegramUserId()
    setUserId(uid)

    if (uid) {
      checkPickedStatus(uid)
    } else {
      setLoading(false)
    }
  }, [])

  async function checkPickedStatus(uid) {
    try {
      const todayPicked = await hasPickedToday(uid)
      setPicked(todayPicked)
      // TODO: 查询广告摘取状态，如果后端有记录可同步
      // setAdPicked(todayAdPicked)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // ---------------------------
  // 免费摘樱桃
  // ---------------------------
  async function handleFirstPick() {
    if (!userId || picked || loading) return

    setLoading(true)
    try {
      await pickCherry(userId)
      setPicked(true)
      setCoins(prev => prev + 25)
      setCherryCount(prev => prev + 1)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // ---------------------------
  // 看广告
  // ---------------------------
  function watchAd() {
    if (watchingAd || adWatched) return
    setWatchingAd(true)

    setTimeout(() => {
      setWatchingAd(false)
      setAdWatched(true)
      setCoins(prev => prev + 50)
    }, 5000)
  }

  // ---------------------------
  // 广告摘樱桃
  // ---------------------------
  async function handleAdPick() {
    if (!userId || !adWatched || adPicked) return
    setLoading(true)
    await new Promise(res => setTimeout(res, 1000))
    setAdPicked(true)
    setCoins(prev => prev + 25)
    setCherryCount(prev => prev + 1)
    setLoading(false)
  }

  // ---------------------------
  // 底部导航
  // ---------------------------
  const handleNavClick = (section) => console.log(`Navigate to ${section}`)

  // ---------------------------
  // 按钮状态
  // ---------------------------
  const firstPickDisabled = !userId || picked || loading
  const adPickDisabled = !userId || !adWatched || adPicked || loading

  return (
    <div
      style={{
        maxWidth: 360,
        margin: '0 auto',
        padding: '16px 16px 80px 16px',
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        color: '#f8fafc',
        fontFamily: '"Segoe UI", -apple-system, system-ui, sans-serif',
      }}
    >
      {/* 顶部状态栏 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        padding: '12px 16px',
        backgroundColor: 'rgba(30,41,59,0.8)',
        borderRadius: 16,
      }}>
        {/* 等级 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          padding: '8px 12px',
          borderRadius: 12,
        }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
            fontWeight: 'bold',
            color: '#7c3aed',
          }}>{level}</div>
          <div style={{ fontSize: 14, fontWeight: 'bold' }}>Level</div>
        </div>

        {/* 樱桃数量 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '6px 16px',
          borderRadius: 12,
          backgroundColor: 'rgba(220,38,38,0.15)',
          border: '1px solid rgba(220,38,38,0.3)',
        }}>
          <span style={{ fontSize: 28, marginRight: 8 }}>🍒</span>
          <span style={{ fontWeight: 800, fontSize: 24, color: '#fecaca' }}>{cherryCount}</span>
        </div>

        {/* 金币 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          padding: '8px 12px',
          borderRadius: 12,
        }}>
          <span style={{ fontSize: 18, marginRight: 6 }}>💰</span>
          <span style={{ fontWeight: 'bold', fontSize: 16 }}>{coins}</span>
        </div>
      </div>

      {/* 🌳 樱桃树区域 */}
      <div style={{
        backgroundColor: 'rgba(30,41,59,0.8)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 16,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle at center, rgba(251,113,133,0.1) 0%, transparent 70%)',
          zIndex: 0,
        }}></div>

        <div style={{
          fontSize: 160,
          textAlign: 'center',
          marginBottom: 24,
          filter: picked && !adWatched ? 'grayscale(0.5) opacity(0.7)' : 'drop-shadow(0 8px 24px rgba(251,113,133,0.3))',
          animation: (picked && !adWatched) ? 'none' : 'float 3s ease-in-out infinite',
          zIndex: 1,
          position: 'relative',
        }}>🌳</div>

        {/* 状态提示 */}
        <div style={{
          textAlign: 'center',
          padding: 14,
          borderRadius: 14,
          backgroundColor: 'rgba(30,41,59,0.9)',
          border: '1px solid rgba(148,163,184,0.2)',
          marginBottom: 24,
          zIndex: 1,
        }}>
          <div style={{ fontWeight: 'bold', fontSize: 18 }}>
            {picked 
              ? adWatched 
                ? adPicked ? '🎉 今日樱桃已摘完！' : '✅ 广告已完成！'
                : '🍒 今日已摘取！'
              : '🍒 每日免费摘取'}
          </div>
          <div style={{ fontSize: 14, color: '#94a3b8' }}>
            {picked 
              ? adWatched
                ? adPicked ? '下次摘取将在24小时后刷新' : '点击下方按钮再摘一次'
                : '观看广告可再摘一次'
              : '点击下方按钮收获今日樱桃'}
          </div>
        </div>

        {/* 免费摘取按钮 */}
        <GradientButton
          gradient="linear-gradient(135deg, #dc2626, #b91c1c)"
          disabled={firstPickDisabled}
          loading={loading && !picked}
          onClick={handleFirstPick}
        >
          {picked ? '✅ 今日已摘取' : '🍒 免费摘取樱桃'}
        </GradientButton>

        {/* 广告摘取区域 */}
        {picked && !adPicked && (
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(148,163,184,0.2)' }}>
            {/* 广告状态提示 */}
            <div style={{
              marginBottom: 16,
              padding: 12,
              borderRadius: 12,
              backgroundColor: adWatched ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
              border: `1px solid ${adWatched ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
              textAlign: 'center',
            }}>
              <div style={{ fontWeight: 600, color: adWatched ? '#86efac' : '#fde68a' }}>
                {adWatched ? '✅ 广告已完成，可额外摘取一次' : '观看广告可额外摘取一次'}
              </div>
            </div>

            {!adWatched && (
              <GradientButton
                gradient="linear-gradient(135deg, #f59e0b, #d97706)"
                disabled={!userId || watchingAd}
                loading={watchingAd}
                onClick={watchAd}
              >
                🎬 观看广告 (+50金币)
              </GradientButton>
            )}

            {adWatched && (
              <GradientButton
                gradient="linear-gradient(135deg, #10b981, #059669)"
                disabled={adPickDisabled}
                loading={loading && adWatched}
                onClick={handleAdPick}
              >
                🍒 额外摘取一次
              </GradientButton>
            )}
          </div>
        )}
      </div>

      {/* 奖励提示 */}
      {picked && !adPicked && (
        <div style={{
          marginBottom: 20,
          padding: 14,
          backgroundColor: 'rgba(30,41,59,0.8)',
          borderRadius: 14,
          border: '1px solid rgba(148,163,184,0.1)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 14, color: '#94a3b8' }}>
            完成广告可额外获得 <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>+50金币</span> 和 <span style={{ color: '#fecaca', fontWeight: 'bold' }}>+1樱桃</span>
          </div>
        </div>
      )}

      {/* 底部导航 */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: 360,
        margin: '0 auto',
        backgroundColor: 'rgba(15,23,42,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(148,163,184,0.1)',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-around',
        zIndex: 100,
      }}>
        {[
          { icon: '🏠', label: '主页' },
          { icon: '🌳', label: '农场' },
          { icon: '🏆', label: '排行' },
          { icon: '👤', label: '我的' },
        ].map((item, index) => (
          <button
            key={index}
            onClick={() => handleNavClick(item.label)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              color: index === 1 ? '#10b981' : '#94a3b8',
              fontSize: 12,
              fontWeight: index === 1 ? 'bold' : 'normal',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 4 }}>{item.icon}</div>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* 全局动画 */}
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
  )
}
