import { useEffect, useState } from 'react'
import { getOrCreateUser } from '../lib/useTelegramUser'
import { pickCherry, hasPickedToday } from '../lib/cherryService'

export default function CherryTree() {
  const [user, setUser] = useState(null)
  const [cherries, setCherries] = useState(0)
  const [picked, setPicked] = useState(false)
  const [loading, setLoading] = useState(true)

  // 初始化 Telegram 用户
  useEffect(() => {
    async function initUser() {
      const u = await getOrCreateUser()
      if (!u) {
        setLoading(false)
        return
      }
      setUser(u)

      // 查询今天是否摘过
      const pickedToday = await hasPickedToday(u.id)
      setPicked(pickedToday)

      // 查询当前樱桃数
      const { data, error } = await fetchCurrentCherries(u.id)
      if (!error) setCherries(data?.cherries ?? 0)

      setLoading(false)
    }
    initUser()
  }, [])

  async function fetchCurrentCherries(userId) {
    try {
      const { data, error } = await getOrCreateUserCherries(userId)
      return { data, error }
    } catch (e) {
      console.error(e)
      return { data: null, error: e }
    }
  }

  async function handlePick() {
    if (!user || picked || loading) return
    setLoading(true)
    const { new_cherries, picked: isPicked } = await pickCherry(user.id)
    setCherries(new_cherries)
    setPicked(isPicked)
    setLoading(false)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      padding: '20px',
      fontFamily: '"Segoe UI", sans-serif',
      color: '#fff',
      maxWidth: '360px',
      margin: '0 auto'
    }}>
      <div style={{ fontSize: '32px' }}>🍒 樱桃数: {cherries}</div>

      <button
        onClick={handlePick}
        disabled={!user || picked || loading}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '12px',
          border: 'none',
          background: picked ? '#64748b' : '#dc2626',
          color: '#fff',
          fontSize: '20px',
          fontWeight: 'bold',
          cursor: (!user || picked) ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        {loading
          ? '加载中...'
          : picked
            ? '✅ 今日已摘取'
            : '摘樱桃'}
      </button>

      {!user && (
        <div style={{ fontSize: '14px', color: '#94a3b8', textAlign: 'center' }}>
          请在 Telegram 内打开
        </div>
      )}
    </div>
  )
}
