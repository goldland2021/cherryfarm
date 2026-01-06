import { useEffect, useState } from 'react'
import { useTelegramUser } from '../lib/useTelegramUser'
import { hasPickedToday, pickCherry } from '../lib/cherryService'

export default function CherryTree() {
  const [user, setUser] = useState(null)
  const [picked, setPicked] = useState(false)
  const [cherries, setCherries] = useState(0)
  const [loading, setLoading] = useState(true)

  // 获取 Telegram 用户信息
  useEffect(() => {
    const tgUser = useTelegramUser()
    setUser(tgUser)
  }, [])

  // 查询今天是否已摘
  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    let alive = true

    async function checkPicked() {
      const result = await hasPickedToday(user)
      if (alive) setPicked(result)

      // 同步显示总樱桃数
      const total = await fetchTotalCherries(user)
      if (alive) setCherries(total)

      setLoading(false)
    }

    checkPicked()
    return () => (alive = false)
  }, [user])

  async function fetchTotalCherries(user) {
    const { count, error } = await pickCherryCount(user)
    return count ?? 0
  }

  // 新增函数: 只获取总樱桃数，不插入
  async function pickCherryCount(user) {
    const { count, error } = await import('../lib/supabaseClient').then(m =>
      m.supabase
        .from('cherry_picks')
        .select('id', { head: true, count: 'exact' })
        .eq('user_id', user.id)
    )
    return { count, error }
  }

  async function handlePick() {
    if (!user || picked || loading) return

    setLoading(true)
    try {
      const total = await pickCherry(user)
      setCherries(total)
      setPicked(true)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  return (
    <div style={{ textAlign: 'center', padding: 20 }}>
      <div style={{ fontSize: 48 }}>🌳</div>
      <div style={{ fontSize: 24, margin: 12 }}>🍒 樱桃数: {cherries}</div>

      <button
        onClick={handlePick}
        disabled={loading || picked || !user}
        style={{
          padding: '12px 24px',
          fontSize: 18,
          borderRadius: 12,
          cursor: loading || picked ? 'not-allowed' : 'pointer',
          backgroundColor: picked ? '#64748b' : '#dc2626',
          color: 'white',
          border: 'none',
        }}
      >
        {loading ? '加载中...' : picked ? '今日已摘' : '摘樱桃'}
      </button>
    </div>
  )
}
