import { useEffect, useState } from 'react'
import { useTelegramUser } from '../lib/useTelegramUser'
import { hasPickedToday, pickCherry } from '../lib/cherryService'
import { supabase } from '../lib/supabaseClient'  // 直接导入 supabase

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
      try {
        const result = await hasPickedToday(user)
        if (alive) setPicked(result)

        // 查询总樱桃数
        const total = await getTotalCherries(user)
        if (alive) {
          setCherries(total)
          console.log('总樱桃数:', total, '用户:', user.id)
        }
      } catch (error) {
        console.error('检查状态失败:', error)
      }
      setLoading(false)
    }

    checkPicked()
    return () => (alive = false)
  }, [user])

  // 获取总樱桃数
  async function getTotalCherries(user) {
    try {
      const { count, error } = await supabase
        .from('cherry_picks')
        .select('id', { head: true, count: 'exact' })
        .eq('user_id', user.id)

      if (error) {
        console.error('获取樱桃数失败:', error)
        return 0
      }

      console.log('数据库查询结果:', { count, user: user.id })
      return count || 0
    } catch (error) {
      console.error('获取樱桃数异常:', error)
      return 0
    }
  }

  async function handlePick() {
    if (!user || picked || loading) return

    setLoading(true)
    try {
      const total = await pickCherry(user)
      console.log('摘樱桃后总数:', total)
      setCherries(total)
      setPicked(true)
    } catch (e) {
      console.error('摘樱桃失败:', e)
      alert('摘樱桃失败，请稍后重试')
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
      
      {/* 调试信息 */}
      {user && (
        <div style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
          用户ID: {user.id}
        </div>
      )}
    </div>
  )
}