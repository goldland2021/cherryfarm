import { useState, useEffect } from 'react'
import { getTelegramUserId } from '../lib/useTelegramUser'
import { hasPickedToday, pickCherry } from '../lib/cherryService'

export default function CherryTree() {
  const [userId, setUserId] = useState(null)
  const [picked, setPicked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [telegramReady, setTelegramReady] = useState(false)

  // 页面加载后初始化 Telegram WebApp
  useEffect(() => {
    console.log('Checking Telegram WebApp...')
    console.log('window.Telegram exists:', !!window.Telegram)
    console.log('Telegram.WebApp exists:', !!window.Telegram?.WebApp)
    
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      
      // 初始化 Telegram WebApp
      tg.ready()
      tg.expand()
      
      // 等待一下确保初始化完成
      setTimeout(() => {
        console.log('Telegram WebApp initData:', tg.initData)
        console.log('Telegram WebApp initDataUnsafe:', tg.initDataUnsafe)
        console.log('Telegram user:', tg.initDataUnsafe?.user)
        
        // 获取用户ID
        const userId = tg.initDataUnsafe?.user?.id
        if (userId) {
          console.log('Found Telegram user ID:', userId)
          setUserId(userId.toString())
        } else {
          console.warn('No user ID found in Telegram WebApp')
        }
        
        setTelegramReady(true)
      }, 100)
    } else {
      console.warn('Telegram WebApp not found')
      setTelegramReady(false)
      
      // 尝试使用原来的 getTelegramUserId 方法作为后备
      const tgUserId = getTelegramUserId()
      if (tgUserId) {
        console.log('Using backup method, user ID:', tgUserId)
        setUserId(tgUserId)
      }
    }
  }, [])

  // 检查今天是否已摘（在 telegramReady 或 userId 变化时）
  useEffect(() => {
    let alive = true

    async function checkStatus() {
      if (!userId) {
        console.log('No user ID, skipping status check')
        setPicked(false)
        setLoading(false)
        return
      }

      try {
        console.log('Checking status for user:', userId)
        const result = await hasPickedToday(userId)
        if (alive) setPicked(result)
      } catch (err) {
        console.error('check cherry status failed', err)
      } finally {
        if (alive) setLoading(false)
      }
    }

    if (userId) {
      checkStatus()
    } else {
      setLoading(false)
    }
    
    return () => {
      alive = false
    }
  }, [userId])

  // 点击摘樱桃
  async function handlePick() {
    if (!userId || picked || loading) return

    try {
      setLoading(true)
      await pickCherry(userId)
      setPicked(true)
      alert('🎉 成功摘到一颗樱桃！')
    } catch (err) {
      console.error('pick cherry failed', err)
      alert('🍒 摘樱桃失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  // 添加一个手动刷新按钮用于调试
  const refreshTelegramData = () => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      const user = tg.initDataUnsafe?.user
      console.log('Manual refresh - Telegram user:', user)
      if (user?.id) {
        setUserId(user.id.toString())
      }
    } else {
      console.log('Telegram WebApp not available')
    }
  }

  return (
    <div style={{ textAlign: 'center' }}>
      {/* 树 */}
      <div style={{ fontSize: 120, marginBottom: 10 }}>🌳</div>

      {/* 按钮区 */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button
          disabled={loading || picked || !userId}
          onClick={handlePick}
          style={{
            padding: '6px 12px',
            opacity: loading || picked || !userId ? 0.5 : 1,
            cursor: loading || picked || !userId ? 'not-allowed' : 'pointer',
          }}
        >
          {loading
            ? '⏳ 检查中...'
            : !userId
            ? '🚫 请在 Telegram 打开'
            : picked
            ? '✅ 今天已摘'
            : '🍒 摘一颗'}
        </button>

        <button
          onClick={() => alert('📺 这里以后接广告')}
          style={{ padding: '6px 12px' }}
        >
          🌞 帮樱桃成熟
        </button>
        
        {/* 调试按钮 */}
        <button
          onClick={refreshTelegramData}
          style={{ padding: '6px 12px', fontSize: '10px', opacity: 0.7 }}
        >
          🔄 调试
        </button>
      </div>

      {/* 状态提示 */}
      <div style={{ fontSize: 12, marginTop: 6, opacity: 0.6 }}>
        {userId
          ? picked
            ? '今天已经摘过樱桃了 🌙'
            : '今天还可以摘一颗 🍒'
          : '请从 Telegram 打开本页面'}
      </div>

      {/* 调试信息 */}
      <div style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>
        Telegram User ID: {userId ?? '未获取'}
      </div>
      <div style={{ fontSize: 10, marginTop: 4, opacity: 0.3 }}>
        Telegram object: {window.Telegram ? 'YES' : 'NO'} <br />
        WebApp object: {window.Telegram?.WebApp ? 'YES' : 'NO'} <br />
        Telegram Ready: {telegramReady ? 'YES' : 'NO'}
      </div>
    </div>
  )
}