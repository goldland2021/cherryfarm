// src/farm/CherryTree.jsx
import { useEffect, useState } from 'react'
import { getOrCreateUser } from '../lib/useTelegramUser'
import { pickCherry } from '../lib/cherryService'

export default function CherryTree() {
  const [user, setUser] = useState(null)
  const [cherries, setCherries] = useState(0)
  const [picked, setPicked] = useState(false)
  const [loading, setLoading] = useState(true)

  // 初始化用户 + 樱桃数
  useEffect(() => {
    async function init() {
      setLoading(true)
      const u = await getOrCreateUser()
      if (!u) {
        setLoading(false)
        return
      }
      setUser(u)

      // 查询今天是否已摘
      const { new_cherries, picked } = await pickCherry(u.id)
      setCherries(new_cherries)
      setPicked(picked)
      setLoading(false)
    }
    init()
  }, [])

  // 点击摘樱桃
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
        onMouseOver={e => { if (!picked && user) e.target.style.transform = 'translateY(-2px)' }}
        onMouseOut={e => e.target.style.transform = 'translateY(0)'}
      >
        {loading
          ? '加载中...'
          : picked
            ? '✅ 今日已摘取'
            : '摘樱桃'}
      </button>

      {!user && (
        <div style={{ fontSize: '14px', color: '#94a3b8' }}>
          请在 Telegram 内打开
        </div>
      )}
    </div>
  )
}
