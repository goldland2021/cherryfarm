import { useEffect, useState } from 'react'
import { getTelegramUserId } from '../lib/telegram'
import { hasPickedToday, pickCherry } from '../lib/cherryService'

export default function CherryTree() {
  const [userId, setUserId] = useState(null)
  const [picked, setPicked] = useState(false)
  const [adPicked, setAdPicked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [cherries, setCherries] = useState(0)

  // 获取 Telegram 用户
  useEffect(() => {
    setUserId(getTelegramUserId())
  }, [])

  // 是否今天已摘
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    hasPickedToday(userId).then(result => {
      setPicked(result)
      setLoading(false)
    })
  }, [userId])

  // 免费摘
  const handlePick = async () => {
    if (picked || loading) return
    setLoading(true)
    await pickCherry(userId)
    setPicked(true)
    setCherries(c => c + 1)
    setLoading(false)
  }

  // 广告摘（假广告）
  const handleAdPick = () => {
    if (adPicked) return
    setAdPicked(true)
    setCherries(c => c + 1)
  }

  return (
    <div style={styles.page}>
      {/* 樱桃数量 */}
      <div style={styles.count}>
        🍒 {cherries}
      </div>

      {/* 樱桃树 */}
      <div style={styles.tree}>🌳</div>

      {/* 免费按钮 */}
      {!picked && (
        <button style={styles.button} onClick={handlePick}>
          点击摘樱桃
        </button>
      )}

      {/* 广告按钮 */}
      {picked && !adPicked && (
        <button style={styles.button} onClick={handleAdPick}>
          看广告再摘一次
        </button>
      )}

      {/* 今日结束 */}
      {picked && adPicked && (
        <div style={styles.done}>今天摘完了</div>
      )}
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0f172a',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
    fontSize: '20px',
  },
  count: {
    fontSize: '28px',
    fontWeight: 'bold',
  },
  tree: {
    fontSize: '120px',
  },
  button: {
    padding: '16px 32px',
    fontSize: '18px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
  },
  done: {
    opacity: 0.6,
    fontSize: '16px',
  },
}
