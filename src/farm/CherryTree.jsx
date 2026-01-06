import { useEffect, useState } from 'react'
import { getOrCreateUser } from '../lib/useTelegramUser'
import { pickCherry, hasPickedToday } from '../lib/cherryService'

export default function CherryTree() {
  const [user, setUser] = useState(null)
  const [cherries, setCherries] = useState(0)
  const [picked, setPicked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const u = await getOrCreateUser()
      if (!u) {
        setLoading(false)
        return
      }
      setUser(u)

      const pickedToday = await hasPickedToday(u.id)
      setPicked(pickedToday)

      // 如果已经摘过就统计总数
      if (pickedToday) {
        const { length } = await fetchCherries(u.id)
        setCherries(length)
      }

      setLoading(false)
    }

    async function fetchCherries(userId) {
      const { data, error } = await window.supabase
        .from('cherry_picks')
        .select('id')
        .eq('user_id', userId)
      if (error) return { length: 0 }
      return { length: data?.length ?? 0 }
    }

    init()
  }, [])

  async function handlePick() {
    if (!user || picked || loading) return
    setLoading(true)
    try {
      const total = await pickCherry(user.id)
      setCherries(total)
      setPicked(true)
    } catch (e) {
      console.error(e)
    }
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
      <div style={{ fontSize: '28px' }}>🍒 樱桃数: {cherries}</div>

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
