import { useEffect, useState } from 'react'
import { getTelegramUserId } from '../lib/telegram'
import { hasPickedToday, pickCherry } from '../lib/cherryService'

export default function CherryTree() {
  const [userId, setUserId] = useState(null)
  const [picked, setPicked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [cherryCount, setCherryCount] = useState(42) // 初始樱桃数量

  // 广告状态
  const [adWatched, setAdWatched] = useState(false)
  const [watchingAd, setWatchingAd] = useState(false)

  // 游戏状态
  const [coins, setCoins] = useState(150)
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(5)

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

  async function handlePick() {
    if (!userId || picked || loading || !adWatched) return

    setLoading(true)
    await pickCherry(userId)
    setPicked(true)
    setLoading(false)
    setCoins(prev => prev + 25)
    // 摘樱桃增加樱桃数量
    setCherryCount(prev => prev + 1)
  }

  // 导航按钮处理
  const handleNavClick = (section) => {
    alert(`即将跳转到 ${section} 页面（功能开发中）`)
  }

  return (
    <div
      style={{
        maxWidth: 360,
        margin: '0 auto',
        padding: '16px 16px 80px 16px',
        minHeight: '100vh',
        backgroundColor: '#f0f8ff',
        position: 'relative',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* 顶部游戏状态栏 - 重新布局 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '10px 15px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        {/* 左侧：生命值 */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '24px',
            height: '24px',
            backgroundColor: '#FF6B6B',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '8px',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#fff'
          }}>❤️</div>
          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{lives}</span>
        </div>

        {/* 中央：樱桃数量 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          margin: '0 15px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FFEBEE',
            padding: '8px 16px',
            borderRadius: '20px',
            border: '2px solid #FFCDD2',
            minWidth: '120px',
          }}>
            <span style={{
              fontSize: '24px',
              marginRight: '8px',
              display: 'block',
            }}>🍒</span>
            <span style={{
              fontWeight: 'bold',
              fontSize: '20px',
              color: '#D32F2F',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}>{cherryCount}</span>
          </div>
          <div style={{
            fontSize: '12px',
            color: '#666',
            marginTop: '4px',
            fontWeight: '500',
          }}>
            Cherry Count
          </div>
        </div>

        {/* 右侧：金币 */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '24px',
            height: '24px',
            backgroundColor: '#FFD700',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '8px',
            fontSize: '12px',
            fontWeight: 'bold',
          }}>💰</div>
          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{coins}</span>
        </div>
      </div>

      {/* 关卡显示 */}
      <div style={{
        textAlign: 'center',
        marginBottom: '25px',
        padding: '10px',
        backgroundColor: '#4CAF50',
        borderRadius: '20px',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '18px',
        boxShadow: '0 4px 6px rgba(76, 175, 80, 0.3)',
      }}>
        Level {level}/20
      </div>

      {/* 🌳 樱桃树主区域 */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '20px',
        padding: '30px 20px',
        marginBottom: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '140px',
          marginBottom: '10px',
          filter: picked ? 'grayscale(0.3) opacity(0.8)' : 'none',
          transition: 'all 0.3s',
        }}>🌳</div>
        
        {/* 状态提示 */}
        <div style={{
          marginBottom: '20px',
          fontSize: '16px',
          color: '#666',
          padding: '10px',
          borderRadius: '10px',
          backgroundColor: picked ? '#e8f5e9' : '#fff3e0',
          border: `2px solid ${picked ? '#c8e6c9' : '#ffcc80'}`,
        }}>
          {picked
            ? '🎉 今天已经摘过樱桃啦！明天再来吧～'
            : adWatched
            ? '✅ 广告已完成，点击下方按钮摘取樱桃！'
            : '📺 观看广告即可摘取樱桃'}
        </div>

        {/* 🎬 看广告按钮 */}
        {!picked && !adWatched && (
          <button
            onClick={watchAd}
            disabled={!userId || watchingAd}
            style={{
              width: '100%',
              padding: '15px 0',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #ffb703, #ff9800)',
              color: '#000',
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '15px',
              cursor: watchingAd ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 8px rgba(255, 152, 0, 0.3)',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => !watchingAd && (e.target.style.transform = 'translateY(-2px)')}
            onMouseOut={e => e.target.style.transform = 'translateY(0)'}
          >
            {watchingAd ? '📺 广告播放中…' : '🎬 观看广告 (奖励 +50 coins)'}
          </button>
        )}

        {/* 🍒 摘樱桃按钮 */}
        <button
          disabled={!userId || picked || loading || !adWatched}
          onClick={handlePick}
          style={{
            width: '100%',
            padding: '18px 0',
            borderRadius: '14px',
            border: 'none',
            background: picked 
              ? '#cccccc' 
              : 'linear-gradient(135deg, #e63946, #d00000)',
            color: '#fff',
            fontSize: '20px',
            fontWeight: 'bold',
            opacity: (!adWatched && !picked) || !userId ? 0.5 : 1,
            cursor: (!adWatched && !picked) || !userId ? 'not-allowed' : 'pointer',
            boxShadow: picked 
              ? 'none' 
              : '0 6px 12px rgba(230, 57, 70, 0.4)',
            transition: 'all 0.2s',
          }}
          onMouseOver={e => {
            if (userId && !picked && adWatched) {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 8px 16px rgba(230, 57, 70, 0.5)'
            }
          }}
          onMouseOut={e => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = picked 
              ? 'none' 
              : '0 6px 12px rgba(230, 57, 70, 0.4)'
          }}
        >
          {loading
            ? '⏳ 摘取中…'
            : !userId
            ? '🚫 请在 Telegram 内打开'
            : picked
            ? '✅ 今日已摘取'
            : '🍒 摘取樱桃 (奖励 +25 coins)'}
        </button>
      </div>

      {/* 底部导航栏 */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: '360px',
        margin: '0 auto',
        backgroundColor: '#fff',
        borderTop: '2px solid #4CAF50',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-around',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        zIndex: 100,
      }}>
        {['Harvest', 'Shop', 'Inventory', 'Farm', 'Tasks', 'Profile'].map((item, index) => (
          <button
            key={index}
            onClick={() => handleNavClick(item)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              color: index === 0 ? '#4CAF50' : '#666',
              fontSize: '12px',
              fontWeight: index === 0 ? 'bold' : 'normal',
              cursor: 'pointer',
              padding: '8px 4px',
              borderRadius: '8px',
              transition: 'all 0.2s',
              minWidth: '50px',
            }}
            onMouseOver={e => {
              e.target.style.backgroundColor = '#f5f5f5'
              e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseOut={e => {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.transform = 'translateY(0)'
            }}
          >
            <div style={{
              fontSize: '20px',
              marginBottom: '4px',
            }}>
              {index === 0 && '🍒'}
              {index === 1 && '🛒'}
              {index === 2 && '📦'}
              {index === 3 && '🌱'}
              {index === 4 && '📝'}
              {index === 5 && '👤'}
            </div>
            <span>{item}</span>
          </button>
        ))}
      </div>

      {/* 调试信息 */}
      <div style={{ 
        fontSize: '10px', 
        marginTop: '12px', 
        opacity: 0.4,
        padding: '8px',
        backgroundColor: '#f5f5f5',
        borderRadius: '6px',
      }}>
        UID: {userId ?? '未获取'} | 
        Telegram: {window.Telegram ? 'YES' : 'NO'} |
        Ad Watched: {adWatched ? 'YES' : 'NO'}
      </div>
    </div>
  )
}