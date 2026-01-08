// src/farm/FarmScene.jsx
import { useState, useEffect } from 'react';
import SkyBar from './SkyBar';
import CherryTree from './CherryTree';
import FarmBg from '../assets/farm-bg.png';

export default function FarmScene() {
  const [totalCherries, setTotalCherries] = useState(0);
  const [adCountToday, setAdCountToday] = useState(0); // 今日看广告次数
  const MAX_AD_COUNT = 3; // 每日最多看3次广告

  // 初始化：读取今日看广告次数（MVP阶段用本地存储，后续可存Supabase）
  useEffect(() => {
    const today = new Date().toLocaleDateString();
    const savedAdData = localStorage.getItem('cherryAdData');
    if (savedAdData) {
      const { date, count } = JSON.parse(savedAdData);
      if (date === today) {
        setAdCountToday(count);
      }
    }
  }, []);

  // 更新樱桃数（给CherryTree用）
  const handleUpdateTotalCherries = (newTotal) => {
    setTotalCherries(newTotal);
  };

  // 看广告得樱桃核心逻辑
  const handleWatchAdGetCherry = async () => {
    // 1. 检查今日次数是否达上限
    if (adCountToday >= MAX_AD_COUNT) {
      alert(`今日已看${MAX_AD_COUNT}次广告，明天再来吧～`);
      return;
    }

    // 2. MVP阶段：模拟广告播放（实际对接广告SDK时替换这部分）
    alert('正在播放广告...（5秒后关闭）\n广告完成后将获得2个樱桃！');
    
    // 模拟广告时长（5秒）
    setTimeout(async () => {
      try {
        // 3. 广告完成：增加2个樱桃
        const newTotal = totalCherries + 2;
        setTotalCherries(newTotal);
        
        // 4. 更新今日广告次数并存储
        const newAdCount = adCountToday + 1;
        setAdCountToday(newAdCount);
        const today = new Date().toLocaleDateString();
        localStorage.setItem('cherryAdData', JSON.stringify({ date: today, count: newAdCount }));

        // 5. 同步更新到Supabase（核心逻辑，和采摘樱桃的存储一致）
        // 这里复用采摘樱桃的逻辑，只需更新total_cherries字段即可
        if (window.userInfo) { // 假设userInfo从CherryTree的useTelegramUser获取，可传递过来
          await supabase
            .from('cherry_users')
            .update({ total_cherries: newTotal })
            .eq('user_id', window.userInfo.id);
        }

        alert(`广告看完啦！获得2个樱桃，当前累计：${newTotal}🍒`);
      } catch (error) {
        alert('广告播放失败，请重试～');
        console.error('广告得樱桃失败:', error);
      }
    }, 5000); // 模拟5秒广告
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
      {/* 顶部导航栏：传递樱桃数 + 广告按钮点击事件 */}
      <SkyBar 
        totalCherries={totalCherries} 
        onWatchAdGetCherry={handleWatchAdGetCherry}
      />

      {/* 核心采摘区域 */}
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
          totalCherries={totalCherries}
          onUpdateTotalCherries={handleUpdateTotalCherries}
        />
      </div>
    </div>
  );
}