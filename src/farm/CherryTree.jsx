import { useEffect, useState } from 'react'
import { useTelegramUser } from '../lib/useTelegramUser'
import { hasPickedToday, pickCherry } from '../lib/cherryService'
import { supabase } from '../lib/supabaseClient'

export default function CherryTree() {
  const [user, setUser] = useState(null)
  const [picked, setPicked] = useState(false)
  const [cherries, setCherries] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 获取 Telegram 用户信息
  useEffect(() => {
    const tgUser = useTelegramUser()
    console.log('Telegram用户:', tgUser)
    setUser(tgUser)
  }, [])

  // 查询今天是否已摘
  useEffect(() => {
    if (!user) {
      console.log('用户未登录')
      setLoading(false)
      return
    }

    let alive = true

    async function checkPicked() {
      try {
        console.log('检查用户状态，用户ID:', user.id)
        
        const result = await hasPickedToday(user)
        console.log('今日是否已摘:', result)
        
        if (alive) setPicked(result)

        // 查询总樱桃数
        const total = await getTotalCherries(user)
        console.log('总樱桃数:', total)
        
        if (alive) {
          setCherries(total)
        }
      } catch (err) {
        console.error('检查状态失败:', err)
        if (alive) setError(err.message)
      }
      if (alive) setLoading(false)
    }

    checkPicked()
    return () => (alive = false)
  }, [user])

  // 获取总樱桃数
  async function getTotalCherries(user) {
    try {
      console.log('查询用户樱桃总数，用户ID:', user.id)
      
      const { count, error } = await supabase
        .from('cherry_picks')
        .select('id', { head: true, count: 'exact' })
        .eq('user_id', user.id)

      if (error) {
        console.error('获取樱桃数失败:', error)
        return 0
      }

      console.log('数据库查询结果 - 总数:', count)
      return count || 0
    } catch (error) {
      console.error('获取樱桃数异常:', error)
      return 0
    }
  }

  async function handlePick() {
    if (!user || picked || loading) {
      console.log('按钮状态:', { user: !!user, picked, loading })
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      console.log('开始摘樱桃...')
      const total = await pickCherry(user)
      console.log('摘樱桃成功，新总数:', total)
      
      setCherries(total)
      setPicked(true)
    } catch (err) {
      console.error('摘樱桃失败:', err)
      setError(err.message)
      alert(`摘樱桃失败: ${err.message}`)
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
          marginBottom: 10,
        }}
      >
        {loading ? '加载中...' : picked ? '今日已摘' : '摘樱桃'}
      </button>

      {/* 显示错误信息 */}
      {error && (
        <div style={{ color: 'red', margin: '10px 0', fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* 调试信息 */}
      <div style={{ 
        marginTop: 20, 
        padding: 10, 
        background: '#f0f0f0', 
        borderRadius: 8,
        fontSize: 12,
        textAlign: 'left',
        color: '#666'
      }}>
        <div>用户状态: {user ? `已登录 (ID: ${user.id})` : '未登录'}</div>
        <div>今日已摘: {picked ? '是' : '否'}</div>
        <div>加载中: {loading ? '是' : '否'}</div>
      </div>
    </div>
  )
}