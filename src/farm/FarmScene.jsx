import { useState, useEffect } from 'react';
import SkyBar from './SkyBar';
import CherryTree from './CherryTree';
import FarmBg from '../assets/farm-bg.png';
import { supabase } from '../lib/supabaseClient';
import { getTotalCherries, CONFIG } from '../lib/cherryService';

export default function FarmScene() {
  const [user, setUser] = useState(null);
  const [totalCherries, setTotalCherries] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化：获取用户+累计樱桃数
  useEffect(() => {
    const init = async () => {
      try {
        const tg = window.Telegram?.WebApp;
        if (!tg || !tg.initDataUnsafe?.user) throw new Error('请在Telegram中打开');
        const telegramUser = {
          id: tg.initDataUnsafe.user.id,
          username: tg.initDataUnsafe.user.username || '未知用户'
        };
        setUser(telegramUser);

        // 获取累计樱桃数
        const total = await getTotalCherries(telegramUser);
        setTotalCherries(total);
      } catch (error) {
        alert(`初始化失败：${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // 更新累计樱桃数
  const handleUpdateTotalCherries = (newTotal) => {
    setTotalCherries(newTotal);
  };

  // 看广告增加次数（前端简单记录，不用数据库）
  const handleWatchAd = () => {
    if (isLoading || !user) return;
    const today = new Date().toLocaleDateString();
    const saved = localStorage.getItem('cherry_ad_times');
    let adCount = 0;
    if (saved) {
      const { date, count } = JSON.parse(saved);
      if (date === today) adCount = count;
    }
    if (adCount >= 5) {
      alert('今日已看5次广告，明天再来吧～');
      return;
    }

    alert('广告播放中...5秒后可额外采摘1次！');
    setTimeout(() => {
      const newAdCount = adCount + 1;
      localStorage.setItem('cherry_ad_times', JSON.stringify({
        date: today,
        count: newAdCount
      }));
      // 增加每日可采摘上限（前端临时）
      CONFIG.DAILY_PICK_LIMIT = 10 + newAdCount;
      alert(`广告完成！今日可摘上限变为${CONFIG.DAILY_PICK_LIMIT}次～`);
    }, 5000);
  };

  if (isLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', color: '#e5e7eb' }}>加载中...</div>;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: `url(${FarmBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backgroundBlendMode: 'overlay',
        color: '#e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <SkyBar totalCherries={totalCherries} onWatchAd={handleWatchAd} />
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
        }}
      >
        <CherryTree
          user={user}
          totalCherries={totalCherries}
          onUpdateTotalCherries={handleUpdateTotalCherries}
        />
      </div>
    </div>
  );
}