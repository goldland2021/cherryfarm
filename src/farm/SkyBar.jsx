import { useState, useEffect } from 'react'
import './firstScreen.css'

export default function SkyBar() {
  const [time, setTime] = useState(new Date())
  const [weather, setWeather] = useState('☀️ 晴朗')

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 60000) // 每分钟更新一次

    // 模拟天气变化
    const weatherTypes = ['☀️ 晴朗', '⛅ 多云', '🌧️ 小雨', '🌈 彩虹']
    const weatherTimer = setInterval(() => {
      const randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)]
      setWeather(randomWeather)
    }, 300000) // 每5分钟变化一次

    return () => {
      clearInterval(timer)
      clearInterval(weatherTimer)
    }
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  return (
    <div className="sky-bar">
      <div className="sky-content">
        <div className="weather-info">
          <span className="weather-icon">{weather.split(' ')[0]}</span>
          <span className="weather-text">{weather.split(' ')[1]}</span>
        </div>
        
        <div className="time-info">
          <div className="current-time">{formatTime(time)}</div>
          <div className="current-date">{formatDate(time)}</div>
        </div>
        
        <div className="farm-title">
          <h1>🍒 樱桃农场</h1>
          <div className="subtitle">每日摘取，积累收获</div>
        </div>
      </div>
      
      <div className="clouds">
        <div className="cloud cloud1">☁️</div>
        <div className="cloud cloud2">☁️</div>
        <div className="cloud cloud3">☁️</div>
      </div>
    </div>
  )
}