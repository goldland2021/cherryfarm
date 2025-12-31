import { useEffect, useState } from 'react'
import { getTelegramUserId } from '../lib/telegram'
import { hasPickedToday, pickCherry } from '../lib/cherryService'

export default function CherryTree() {
  const [userId, setUserId] = useState(null)
  const [picked, setPicked] = useState(false)
  const [loading, setLoading] = useState(true)

  // 只在组件挂载时读取 Telegram
  useEffect(() => {
    const id = getTelegramUserId()
    setUserId(id)
  }, [])

  // 有 userId 后再查 Supabase
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

  async function handlePick() {
    if (!userId || picked || loading) return
    setLoading(true)
    await pickCherry(userId)
    setPicked(true)
    setLoading(false)
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 120 }}>🌳</div>

      <button
        disabled={!userId || picked || loading}
        onClick={handlePick}
      >
        {loading
          ? '⏳ 加载中'
          : !userId
          ? '🚫 请在 Telegram 打开'
          : picked
          ? '✅ 今天已摘'
          : '🍒 摘一颗'}
      </button>

      <div style={{ fontSize: 12, marginTop: 8 }}>
        Telegram User ID: {userId ?? '未获取'}
      </div>

      {/* 调试信息 */}
      <div style={{ fontSize: 10, opacity: 0.4 }}>
        Telegram object: {window.Telegram ? 'YES' : 'NO'} <br />
        WebApp object: {window.Telegram?.WebApp ? 'YES' : 'NO'}
      </div>
    </div>
  )
}
