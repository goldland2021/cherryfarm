// src/farm/FarmScene.jsx
import { useState, useEffect } from 'react';
import SkyBar from './SkyBar';
import CherryTree from './CherryTree';
import FarmBg from '../assets/farm-bg.png';
import { supabase } from '../lib/supabaseClient';

export default function FarmScene() {
  const [totalCherries, setTotalCherries] = useState(0);
  const [user, setUser] = useState(null);
  const [adCountToday, setAdCountToday] = useState(0); // 今日已看广告次数
  const [extraPickTimes, setExtraPickTimes] = useState(0); // 额外可采摘次数（看广告获得）
  
  // 基础配置（可按需调整）
  const BASE_PICK_TIMES = 5; // 每日基础可采摘次数
  const MAX_AD_COUNT = 3; // 每日最多看3次广告
  const AD_REWARD_TIMES = 1; // 每次广告奖励1次可采摘次数

  // 初始化：用户信息+累计樱桃数+今日广告次数
  useEffect(() => {
    // 1. 获取用户信息+累计樱桃数（复用原有逻辑）
    const initUser = async () => {
      const tg = window.Telegram?.WebApp;
      if (tg && tg.initDataUnsafe?.user) {
        const telegramUser = { id: tg.initDataUnsafe.user.id, username: tg.initDataUnsafe.user.username || '未知用户' };
        setUser(telegramUser);
        
        // 统计累计樱桃数（原有逻辑不变）
        const { count } = await supabase
          .from('cherry_picks')
          .select('id', { head: true, count: 'exact' })
          .eq('user_id', telegramUser.id);
        setTotalCherries(count || 0);
      }
    };

    // 2. 读取今日已看广告次数（本地存储，无需同步数据库！）
    const initAdData = () => {
      const today = new Date().toLocaleDateString();
      const saved = localStorage.getItem('cherryAdPickTimes');
      if (saved) {
        const { date, adCount, extraTimes } = JSON.parse(saved);
        if (date === today) {
          setAdCountToday(adCount);
          setExtraPickTimes(extraTimes);
        }
      }
    };

    initUser();
    initAdData();
  }, []);

  // 采摘后更新累计樱桃数（原有逻辑不变）
  const handleUpdateTotalCherries = (newTotal) => {
    setTotalCherries(newTotal);
  };

  // 看广告增加可采摘次数（核心简化逻辑！）
  const handleWatchAdGetPickTimes = async () => {
    if (!user) { alert('请先登录Telegram账号！'); return; }
    if (adCountToday >= MAX_AD_COUNT) { alert(`今日已看${MAX_AD_COUNT}次广告，明天再来吧～`); return; }

    // 1. 模拟广告播放（5秒）
    alert(`正在播放广告...（5秒后关闭）\n广告完成后可额外采摘${AD_REWARD_TIMES}次！`);
    
    setTimeout(() => {
      // 2. 仅更新前端状态，无需操作数据库！
      const newAdCount = adCountToday + 1;
      const newExtraTimes = extraPickTimes + AD_REWARD_TIMES;
      setAdCountToday(newAdCount);
      setExtraPickTimes(newExtraTimes);

      // 3. 本地存储今日广告数据（无需同步数据库）
      const today = new Date().toLocaleDateString();
      localStorage.setItem('cherryAdPickTimes', JSON.stringify({
        date: today,
        adCount: newAdCount,
        extraTimes: newExtraTimes
      }));

      alert(`✅ 广告看完啦！额外获得${AD_REWARD_TIMES}次采摘机会，今日最多可摘${BASE_PICK_TIMES + newExtraTimes}次～`);
    }, 5000);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: `url(${FarmBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backgroundBlendMode: 'overlay',
        color: '#e5e7eb',
        paddingBottom: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* 顶部导航栏：传递樱桃数+广告事件 */}
      <SkyBar 
        totalCherries={totalCherries} 
        onWatchAd={handleWatchAdGetPickTimes} // 调整事件名
      />

      {/* 核心采摘区：传递用户+可采摘上限+更新回调 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          padding: '20px',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          borderRadius: 16,
          margin: '0 10px',
        }}
      >
        <CherryTree
          user={user}
          totalCherries={totalCherries}
          basePickTimes={BASE_PICK_TIMES} // 基础可采摘次数
          extraPickTimes={extraPickTimes} // 广告额外次数
          onUpdateTotalCherries={handleUpdateTotalCherries}
        />
      </div>
    </div>
  );
}