import { useEffect, useState } from 'react'
import { getTelegramUserId } from '../lib/telegram'
import { hasPickedToday, pickCherry } from '../lib/cherryService'

export default function CherryTree() {
  const [userId, setUserId] = useState(null)
  const [picked, setPicked] = useState(false)
  const [adPicked, setAdPicked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [cherries, setCherries] = useState(0)

  useEffect(() => {
    setUserId(getTelegramUserId())
  }, [])

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    hasPickedToday(userId).then(r => {
      setPicked(r)
      setLoading(false)
    })
  }, [userId])

  const handlePick = async () => {
    if (picked || loading) return
    setLoading(true)
    await pickCherry(userId)
    setPicked(true)
    setCherries(c => c + 1)
    setLoading(false)
  }

  const handleAdPick = () => {
    if (adPicked) return
    setAdPicked(true)
    setCherries(c => c + 1)
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.count}>🍒 {cherries}</div>

      <div style={styles.tree}>🌳</div>

      {!picked && (
        <button style={styles.button} onClick={handlePick}>
          点击摘樱桃
        </button>
      )}

      {picked && !adPicked && (
        <button style={styles.button} onClick={handleAdPick}>
          看广告再摘一次
        </button>
      )}

      {picked && adPicked && (
        <div style={styles.done}>今天结束</div>
      )}
    </div>
  )
}

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    padding: '40px 0',
  },
  count: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  tree: {
    fontSize: '120px',
  },
  button: {
    padding: '14px 28px',
    fontSize: '16px',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  done: {
    fontSize: '14px',
    opacity: 0.6,
  },
}
