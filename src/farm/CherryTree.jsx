import { useEffect, useState } from 'react'
import { getTelegramUser } from '../lib/useTelegramUser'
import { addCherry, getCherryCount } from '../lib/cherryService'

export default function CherryTree() {
  const [user, setUser] = useState(null)
  const [cherries, setCherries] = useState(0)
  const [loading, setLoading] = useState(true)

  // 初始化
  useEffect(() => {
    const u = getTelegramUser()
    if (!u) {
      console.warn('❌ Telegram user not ready')
      setLoading(false)
      return
    }

    setUser(u)

    getCherryCount(u.id).then(count => {
      setCherries(count)
      setLoading(false)
    })
  }, [])

  async function handlePick() {
    if (!user || loading) return

    setLoading(true)
    try {
      await addCherry(user)              // 👉 插一条
      const count = await getCherryCount(user.id) // 👉 再查
      setCherries(count)
    } catch (e) {
      alert('摘樱桃失败，查看控制台')
    }
    setLoading(false)
  }

  if (!user) return <div>未获取 Telegram 用户</div>

  return (
    <div style={{ textAlign: 'center', padding: 20 }}>
      <div style={{ fontSize: 22 }}>🍒 樱桃数：{cherries}</div>

      <button
        onClick={handlePick}
        disabled={loading}
        style={{
          marginTop: 12,
          padding: '10px 24px',
          fontSize: 16
        }}
      >
        {loading ? '处理中...' : '摘樱桃'}
      </button>
    </div>
  )
}
