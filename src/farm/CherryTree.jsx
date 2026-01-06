import { useEffect, useState } from 'react'
import { getTelegramUserId } from '../lib/telegram'
import { hasPickedToday, pickCherry } from '../lib/cherryService'

export default function CherryTree() {
  const [userId, setUserId] = useState(null)
  const [picked, setPicked] = useState(false)
  const [adPicked, setAdPicked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [cherryCount, setCherryCount] = useState(428)

  // 广告状态
  const [adWatched, setAdWatched] = useState(false)
  const [watchingAd, setWatchingAd] = useState(false)

  // 游戏状态
  const [coins, setCoins] = useState(2480)
  const [level, setLevel] = useState(7)

  // 获取 Telegram User
  useEffect(() => {
    const id = getTelegramUserId()
    setUserId(id)
  }, [])

  // 查询今天是否已摘
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    let alive = true

    async function check() {
      try {
        const result = await hasPickedToday(userId)
        if (alive) setPicked(result)
      } catch (e) {
        console.error(e)
      } finally {
        if (alive) setLoading(false)
      }
    }

    check()
    return () => (alive = false)
  }, [userId])

  // 模拟看广告
  async function watchAd() {
    if (watchingAd || adWatched) return

    setWatchingAd(true)

    setTimeout(() => {
      setWatchingAd(false)
      setAdWatched(true)
      setCoins(prev => prev + 50)
    }, 5000)
  }

  // 第一次摘樱桃（免费）
  async function handleFirstPick() {
    if (!userId || picked || loading) return

    setLoading(true)
    await pickCherry(userId)
    setPicked(true)
    setLoading(false)
    setCoins(prev => prev + 25)
    setCherryCount(prev => prev + 1)
  }

  // 第二次摘樱桃（看广告后）
  async function handleAdPick() {
    if (!userId || !adWatched || adPicked || loading) return

    setLoading(true)
    setTimeout(async () => {
      setAdPicked(true)
      setLoading(false)
      setCoins(prev => prev + 25)
      setCherryCount(prev => prev + 1)
    }, 1000)
  }

  // 导航按钮处理 - 简化
  const handleNavClick = (section) => {
    console.log(`Navigate to ${section}`)
  }

  return (
    <div
      style={{
        maxWidth: 360,
        margin: '0 auto',
        padding: '16px 16px 80px 16px',
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        position: 'relative',
        fontFamily: '"Segoe UI", -apple-system, system-ui, sans-serif',
        color: '#f8fafc',
      }}
    >
      {/* 顶部状态栏 - 简化 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '12px 16px',
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      }}>
        {/* 等级 */}
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

        {/* 樱桃数量 - 中央位置 */}
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
            <span style={{
              fontSize: '28px',
              marginRight: '8px',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            }}>🍒</span>
            <span style={{
              fontWeight: '800',
              fontSize: '24px',
              color: '#fecaca',
            }}>{cherryCount}</span>
          </div>
        </div>

        {/* 金币 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          padding: '8px 12px',
          borderRadius: '12px',
        }}>
          <span style={{ fontSize: '18px', marginRight: '6px' }}>💰</span>
          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{coins}</span>
        </div>
      </div>

      {/* 🌳 樱桃树主区域 */}
      <div style={{
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '16px',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* 背景装饰 */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle at center, rgba(251, 113, 133, 0.1) 0%, transparent 70%)',
          zIndex: 0,
        }}></div>

        {/* 樱桃树 */}
        <div style={{
          fontSize: '160px',
          marginBottom: '24px',
          textAlign: 'center',
          filter: picked && !adWatched ? 'grayscale(0.5) opacity(0.7)' : 'drop-shadow(0 8px 24px rgba(251, 113, 133, 0.3))',
          transition: 'all 0.3s ease',
          position: 'relative',
          zIndex: 1,
          animation: (picked && !adWatched) ? 'none' : 'float 3s ease-in-out infinite',
        }}>🌳</div>

        {/* 状态信息 */}
        <div style={{
          marginBottom: '24px',
          padding: '14px',
          borderRadius: '14px',
          backgroundColor: 'rgba(30, 41, 59, 0.9)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f8fafc', marginBottom: '4px' }}>
            {picked 
              ? adWatched 
                ? adPicked
                  ? '🎉 今日樱桃已摘完！'
                  : '✅ 广告已完成！'
                : '🍒 今日已摘取！'
              : '🍒 每日免费摘取'}
          </div>
          <div style={{ fontSize: '14px', color: '#94a3b8' }}>
            {picked 
              ? adWatched
                ? adPicked
                  ? '下次摘取将在24小时后刷新'
                  : '点击下方按钮再摘一次'
                : '观看广告可再摘一次'
              : '点击下方按钮收获今日樱桃'}
          </div>
        </div>

        {/* 第一部分：免费摘取按钮 */}
        <div style={{ marginBottom: adWatched && !adPicked ? '20px' : '0' }}>
          <button
            disabled={!userId || picked || loading}
            onClick={handleFirstPick}
            style={{
              width: '100%',
              padding: '20px 0',
              borderRadius: '18px',
              border: 'none',
              background: picked 
                ? 'linear-gradient(135deg, #475569, #64748b)' 
                : 'linear-gradient(135deg, #dc2626, #b91c1c)',
              color: '#ffffff',
              fontSize: '20px',
              fontWeight: '800',
              opacity: !userId ? 0.5 : 1,
              cursor: (!userId || picked) ? 'not-allowed' : 'pointer',
              boxShadow: picked 
                ? 'none' 
                : '0 8px 32px rgba(220, 38, 38, 0.5)',
              transition: 'all 0.3s ease',
              position: 'relative',
              zIndex: 1,
            }}
            onMouseOver={e => {
              if (userId && !picked) {
                e.target.style.transform = 'translateY(-3px)'
                e.target.style.boxShadow = '0 12px 40px rgba(220, 38, 38, 0.7)'
              }
            }}
            onMouseOut={e => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = picked 
                ? 'none' 
                : '0 8px 32px rgba(220, 38, 38, 0.5)'
            }}
          >
            {loading && !picked ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                摘取中...
              </div>
            ) : !userId ? (
              '请在 Telegram 内打开'
            ) : picked ? (
              '✅ 今日已摘取'
            ) : (
              '🍒 免费摘取樱桃'
            )}
          </button>
        </div>

        {/* 第二部分：广告摘取区域 */}
        {picked && !adPicked && (
          <div style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(148, 163, 184, 0.2)',
          }}>
            {/* 广告状态提示 */}
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: adWatched 
                ? 'rgba(34, 197, 94, 0.15)' 
                : 'rgba(245, 158, 11, 0.15)',
              border: `1px solid ${adWatched ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              textAlign: 'center',
            }}>
              <div style={{ fontWeight: '600', color: adWatched ? '#86efac' : '#fde68a' }}>
                {adWatched 
                  ? '✅ 广告已完成，可额外摘取一次' 
                  : '观看广告可额外摘取一次'}
              </div>
            </div>

            {/* 看广告按钮 */}
            {!adWatched && (
              <button
                onClick={watchAd}
                disabled={!userId || watchingAd}
                style={{
                  width: '100%',
                  padding: '18px 0',
                  borderRadius: '16px',
                  border: 'none',
                  background: watchingAd
                    ? 'linear-gradient(135deg, #475569, #64748b)'
                    : 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#ffffff',
                  fontSize: '18px',
                  fontWeight: '800',
                  marginBottom: '12px',
                  cursor: watchingAd ? 'not-allowed' : 'pointer',
                  boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={e => !watchingAd && (e.target.style.transform = 'translateY(-2px)')}
                onMouseOut={e => e.target.style.transform = 'translateY(0)'}
              >
                {watchingAd ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <div style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    广告播放中...
                  </div>
                ) : '🎬 观看广告 (+50金币)'}
              </button>
            )}

            {/* 广告摘取按钮 */}
            {adWatched && (
              <button
                disabled={!userId || adPicked || loading}
                onClick={handleAdPick}
                style={{
                  width: '100%',
                  padding: '20px 0',
                  borderRadius: '18px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  fontSize: '20px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.5)',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={e => {
                  if (userId && !adPicked) {
                    e.target.style.transform = 'translateY(-3px)'
                    e.target.style.boxShadow = '0 12px 40px rgba(16, 185, 129, 0.7)'
                  }
                }}
                onMouseOut={e => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 8px 32px rgba(16, 185, 129, 0.5)'
                }}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <div style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    摘取中...
                  </div>
                ) : '🍒 额外摘取一次'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 奖励提示 */}
      {picked && !adPicked && (
        <div style={{
          marginBottom: '20px',
          padding: '14px',
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          borderRadius: '14px',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '14px', color: '#94a3b8' }}>
            完成广告可额外获得 <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>+50金币</span> 和 <span style={{ color: '#fecaca', fontWeight: 'bold' }}>+1樱桃</span>
          </div>
        </div>
      )}

      {/* 底部导航栏 - 简化 */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: '360px',
        margin: '0 auto',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(148, 163, 184, 0.1)',
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
              fontSize: '12px',
              fontWeight: index === 1 ? 'bold' : 'normal',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={e => {
              e.target.style.backgroundColor = 'rgba(148, 163, 184, 0.1)'
            }}
            onMouseOut={e => {
              e.target.style.backgroundColor = 'transparent'
            }}
          >
            <div style={{
              fontSize: '24px',
              marginBottom: '4px',
            }}>
              {item.icon}
            </div>
            <span>{item.label}</span>
          </button>
        ))}
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
  )
}