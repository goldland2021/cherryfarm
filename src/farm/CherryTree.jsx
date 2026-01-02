import { useEffect, useState } from 'react'
import { getTelegramUserId } from '../lib/telegram'
import { hasPickedToday, pickCherry } from '../lib/cherryService'

export default function CherryTree() {
  const [userId, setUserId] = useState(null)
  const [picked, setPicked] = useState(false)
  const [loading, setLoading] = useState(true)

  // 广告状态
  const [adWatched, setAdWatched] = useState(false)
  const [watchingAd, setWatchingAd] = useState(false)

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

  // 模拟看广告（后面直接替换成真实广告 SDK）
  async function watchAd() {
    if (watchingAd || adWatched) return

    setWatchingAd(true)

    // ⏳ 模拟广告 5 秒
    setTimeout(() => {
      setWatchingAd(false)
      setAdWatched(true)
    }, 5000)
  }

  async function handlePick() {
    if (!userId || picked || loading || !adWatched) return

    setLoading(true)
    await pickCherry(userId)
    setPicked(true)
    setLoading(false)
  }

  return (
    <div
      style={{
        maxWidth: 360,
        margin: '0 auto',
        padding: 16,
        textAlign: 'center',
      }}
    >
      {/* 🌳 树 */}
      <div style={{ fontSize: 120, marginBottom: 8 }}>🌳</div>

      {/* 状态文案 */}
      <div style={{ marginBottom: 12, fontSize: 14, opacity: 0.8 }}>
        {picked
          ? '今天已经摘过樱桃啦 🍒'
          : adWatched
          ? '广告已完成，可以摘樱桃了'
          : '观看广告即可摘一颗樱桃'}
      </div>

      {/* 🎬 看广告按钮 */}
      {!picked && !adWatched && (
        <button
          onClick={watchAd}
          disabled={!userId || watchingAd}
          style={{
            width: '100%',
            padding: '12px 0',
            borderRadius: 12,
            border: 'none',
            background: '#ffb703',
            color: '#000',
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 10,
          }}
        >
          {watchingAd ? '📺 广告播放中…' : '🎬 看广告'}
        </button>
      )}

      {/* 🍒 摘樱桃按钮 */}
      <button
        disabled={!userId || picked || loading || !adWatched}
        onClick={handlePick}
        style={{
          width: '100%',
          padding: '14px 0',
          borderRadius: 14,
          border: 'none',
          background: picked ? '#adb5bd' : '#e63946',
          color: '#fff',
          fontSize: 18,
          fontWeight: 'bold',
          opacity: !adWatched && !picked ? 0.5 : 1,
        }}
      >
        {loading
          ? '⏳ 处理中…'
          : !userId
          ? '🚫 请在 Telegram 打开'
          : picked
          ? '✅ 今日已摘'
          : '🍒 摘一颗樱桃'}
      </button>

      {/* 调试信息（开发期保留） */}
      <div style={{ fontSize: 10, marginTop: 12, opacity: 0.4 }}>
        UID: {userId ?? '未获取'} <br />
        Telegram: {window.Telegram ? 'YES' : 'NO'}
      </div>
    </div>
  )
}
