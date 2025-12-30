import { useEffect } from 'react'

export default function App() {
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready()
    }
  }, [])

  return <FarmScene />
}
