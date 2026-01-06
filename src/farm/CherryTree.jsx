import { useEffect, useState } from 'react'
import { getTelegramUserId } from '../lib/telegram'
import { hasPickedToday, pickCherry } from '../lib/cherryService'

export default function CherryTree() {
  const [userId, setUserId] = useState(null)
  const [picked, setPicked] = useState(false)
  const [adPicked, setAdPicked] = useState(false)
  const [cherries, setCherries] = useState(0)

  useEffect(() => {
    setUserId(getTelegramUserId())
  }, [])

  useEffect(() => {
    if (!userId) return
    hasPickedToday(userId).then(setPicked)
  }, [userId])

  const handleClickTree = async () => {
    if (!userId) return

    // 第一次免费
    if (!picked) {
      await pickCherry(userId)
      setPicked(true)
      setCherries(c => c + 1)
      return
    }

    // 第二次（广告）
    if (!adPicked) {
      setAdPicked(true)
      setCherries(c => c + 1)
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.count}>🍒 {cherries}</div>

      <div style={styles.tree} onClick={handleClickTree}>
        🌳
      </div>
    </div>
  )
}

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '60px',
    gap: '32px',
    userSelect: 'none',
  },
  count: {
    fontSize: '26px',
    fontWeight: 'bold',
  },
  tree: {
    fontSize: '140px',
    cursor: 'pointer',
  },
}
