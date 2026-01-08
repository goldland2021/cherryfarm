import { useState, useEffect } from 'react'
import { useTelegramUser } from '../lib/useTelegramUser'
import { hasPickedToday, pickCherry, getTotalCherries, getStreakDays } from '../lib/cherryService'
import './CherryTree.css'

export default function CherryTree() {
  const { user, isLoading: userLoading, isInTelegramEnv } = useTelegramUser()
  const [picked, setPicked] = useState(false)
  const [cherries, setCherries] = useState(0)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [animation, setAnimation] = useState('')

  // 获取用户数据
  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    let isMounted = true

    async function fetchUserData() {
      try {
        setLoading(true)
        setError('')

        // 并行获取所有数据
        const [hasPicked, total, streakDays] = await Promise.all([
          hasPickedToday(user),
          getTotalCherries(user),
          getStreakDays(user)
        ])

        if (isMounted) {
          setPicked(hasPicked)
          setCherries(total)
          setStreak(streakDays)
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err)
        if (isMounted) {
          setError('加载数据失败，请稍后重试')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchUserData()
    return () => { isMounted = false }
  }, [user])

  // 摘樱桃处理
  async function handlePick() {
    if (!user || picked || loading) return

    setLoading(true)
    setError('')
    setAnimation('picking')

    try {
      const newTotal = await pickCherry(user)
      
      // 成功后的动画
      setCherries(newTotal)
      setPicked(true)
      setAnimation('success')
      
      // 更新连续天数
      const newStreak = await getStreakDays(user)
      setStreak(newStreak)
      
      // 播放音效（可选）
      playPickSound()
      
      // 3秒后重置动画
      setTimeout(() => setAnimation(''), 3000)
    } catch (err) {
      console.error('Failed to pick cherry:', err)
      setError(err.message || '摘樱桃失败，请稍后重试')
      setAnimation('error')
      setTimeout(() => setAnimation(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  // 播放音效
  function playPickSound() {
    if (typeof Audio !== 'undefined') {
      const audio = new Audio('/sounds/pick.mp3')
      audio.volume = 0.3
      audio.play().catch(() => {
        // 静默处理音效播放错误
      })
    }
  }

  // 渲染状态
  if (!isInTelegramEnv && !import.meta.env.DEV) {
    return (
      <div className="cherry-tree-container">
        <div className="tree">🌳</div>
        <div className="error-message">
          请在 Telegram 中打开此应用
        </div>
      </div>
    )
  }

  if (userLoading) {
    return (
      <div className="cherry-tree-container">
        <div className="tree loading">🌳</div>
        <div className="loading-text">加载中...</div>
      </div>
    )
  }

  return (
    <div className={`cherry-tree-container ${animation}`}>
      {/* 树和樱桃动画 */}
      <div className="tree-animation">
        <div className="tree">🌳</div>
        {!picked && (
          <div className="cherries">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="cherry">🍒</span>
            ))}
          </div>
        )}
        {animation === 'picking' && (
          <div className="pick-animation">✨</div>
        )}
        {animation === 'success' && (
          <div className="success-animation">🎉 +1 🍒</div>
        )}
        {animation === 'error' && (
          <div className="error-animation">❌</div>
        )}
      </div>

      {/* 统计信息 */}
      <div className="stats">
        <div className="stat-item">
          <span className="stat-label">樱桃总数:</span>
          <span className="stat-value">{cherries} 🍒</span>
        </div>
        {streak > 0 && (
          <div className="stat-item">
            <span className="stat-label">连续摘取:</span>
            <span className="stat-value streak">{streak} 天 🔥</span>
          </div>
        )}
      </div>

      {/* 摘樱桃按钮 */}
      <button
        className={`pick-button ${picked ? 'picked' : ''} ${animation}`}
        onClick={handlePick}
        disabled={loading || picked || !user}
      >
        {loading ? (
          <span className="button-loading">⏳ 加载中...</span>
        ) : picked ? (
          <span>✅ 今日已摘</span>
        ) : (
          <span>🎯 摘樱桃</span>
        )}
      </button>

      {/* 错误提示 */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* 用户信息 */}
      {user && (
        <div className="user-info">
          <small>
            欢迎, {user.username || `用户${user.id}`}
            {!isInTelegramEnv && import.meta.env.DEV && ' (开发模式)'}
          </small>
        </div>
      )}
    </div>
  )
}