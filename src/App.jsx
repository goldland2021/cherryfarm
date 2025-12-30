import { useEffect } from 'react'
import FarmScene from './farm/FarmScene'

export default function App() {
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready()
    }
  }, [])

  return <FarmScene />
}
