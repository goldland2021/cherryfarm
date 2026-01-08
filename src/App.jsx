import { useEffect, useState } from 'react'
import FarmScene from './farm/FarmScene'
import { testConnection } from './lib/supabaseClient'
import './index.css'

function App() {
  const [dbStatus, setDbStatus] = useState('checking')

  useEffect(() => {
    // 检查数据库连接
    async function checkDbConnection() {
      const result = await testConnection()
      setDbStatus(result.success ? 'connected' : 'failed')
      
      if (!result.success) {
        console.error('Database connection failed:', result.message)
      }
    }

    checkDbConnection()
  }, [])

  return (
    <div className="app">
      {/* 开发模式显示连接状态 */}
      {import.meta.env.DEV && (
        <div className={`dev-banner db-${dbStatus}`}>
          数据库: {dbStatus === 'connected' ? '✅ 已连接' : '❌ 连接失败'}
        </div>
      )}
      
      <FarmScene />
      
      {/* 页脚 */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>🍒 Cherry Farm - 每日摘取你的樱桃</p>
          <div className="footer-links">
            <a href="https://t.me/yourbot" target="_blank" rel="noopener noreferrer">
              🤖 Telegram 机器人
            </a>
            <span className="separator">•</span>
            <a href="https://github.com/yourrepo" target="_blank" rel="noopener noreferrer">
              📦 GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App