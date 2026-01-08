import { useEffect, useState } from 'react'
import { useTelegramUser } from '../lib/useTelegramUser'
import { hasPickedToday, pickCherry, getTotalCherries } from '../lib/cherryService' // 新增 getTotalCherries

export default function CherryTree() {
  const user = useTelegramUser()  // ✅ 直接调用 hook
  const [picked, setPicked] = useState(false)
  const [cherries, setCherries] = useState(0)
  const [loading, setLoading] = useState(true)

  // 查询今天是否已摘及总樱桃数
  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    let isMounted = true

    async function fetchData() {
      try {
        // 并行请求，提高性能
        const [hasPicked, total] = await Promise.all([
          hasPickedToday(user),
          getTotalCherries(user)  // 新增函数，获取总樱桃数
        ])
        
        if (isMounted) {
          setPicked(hasPicked)
          setCherries(total)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
        if (isMounted) {
          setPicked(false)
          setCherries(0)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()
    return () => { isMounted = false }
  }, [user])

  async function handlePick() {
    if (!user || picked || loading) return

    setLoading(true)
    try {
      const newTotal = await pickCherry(user)
      setCherries(newTotal)
      setPicked(true)
    } catch (error) {
      console.error('Failed to pick cherry:', error)
      alert('摘樱桃失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 如果 user 不存在，显示提示
  if (!loading && !user) {
    return (
      <div style={{ textAlign: 'center', padding: 20 }}>
        <div style={{ fontSize: 48 }}>🌳</div>
        <p style={{ color: '#ef4444' }}>
          请在 Telegram 中打开此应用
        </p>
      </div>
    )
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
          transition: 'all 0.3s',
          opacity: loading || picked || !user ? 0.6 : 1,
        }}
      >
        {loading ? '加载中...' : picked ? '今日已摘' : '摘樱桃'}
      </button>
    </div>
  )
}