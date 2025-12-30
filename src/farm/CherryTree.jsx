import { useState, useEffect } from 'react'
import { getTelegramUserId } from '../lib/useTelegramUser'
import { hasPickedToday, pickCherry } from '../lib/cherryService'
const userId = getTelegramUserId()

export default function CherryTree() {
  // Telegram 用户（本地浏览器为 null）
  const userId = getTelegramUserId()

  // 是否已经摘过
  const [picked, setPicked] = useState(false)

  // 加载状态（避免闪烁）
  const [loading, setLoading] = useState(true)

  // 页面加载时检查今天是否已经摘过
  useEffect(() => {
    let alive = true

    async function checkStatus() {
      if (!userId) {
        setPicked(false)
        setLoading(false)
        return
      }

      try {
        const result = await hasPickedToday(userId)
        if (alive) setPicked(result)
      } catch (err) {
        console.error('check cherry status failed', err)
      } finally {
        if (alive) setLoading(false)
      }
    }

    checkStatus()

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
    } catch (err) {
      console.error('pick cherry failed', err)
      alert('🍒 摘樱桃失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ textAlign: 'center' }}>
      {/* 🌳 树 */}
      <div style={{ fontSize: 120, marginBottom: 10 }}>🌳</div>

      {/* 操作区 */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button
          disabled={loading || picked || !userId}
          onClick={handlePick}
          style={{
            padding: '6px 12px',
            opacity: loading || picked ? 0.5 : 1,
            cursor: loading || picked ? 'not-allowed' : 'pointer',
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
      </div>

      {/* 状态提示 */}
      <div style={{ fontSize: 12, marginTop: 6, opacity: 0.6 }}>
        {userId
          ? picked
            ? '今天已经摘过樱桃了 🌙'
            : '今天还可以摘一颗 🍒'
          : '请从 Telegram 打开本页面'}
      </div>
      <div style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>
  Telegram User ID: {userId ?? '未获取'}
</div>

      {/* 调试信息（可保留或删除） */}
      <div style={{ fontSize: 10, marginTop: 4, opacity: 0.3 }}>
        userId: {userId ?? 'no telegram'}
      </div>
    </div>
  )
}
