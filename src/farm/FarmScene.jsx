import { useState, useEffect } from 'react';
import SkyBar from './SkyBar';
import CherryTree from './CherryTree';
import FarmBg from '../assets/farm-bg.png';
import { supabase } from '../lib/supabaseClient';
import { 
  CONFIG, 
  initUserInDB, 
  watchAdAddPickTimes, 
  getTotalCherries, 
  getUserDailyCounts 
} from '../lib/cherryService';

export default function FarmScene() {
  const [user, setUser] = useState(null);
  const [totalCherries, setTotalCherries] = useState(0);
  const [dailyCounts, setDailyCounts] = useState({
    todayPickedCount: 0,
    todayAdCount: 0,
    maxDailyPick: CONFIG.MAX_DAILY_PICK,
    extraPickTimes: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // 初始化：读取用户+数据库防刷数据
  useEffect(() => {
    const init = async () => {
      try {
        // 1. 获取Telegram用户
        const tg = window.Telegram?.WebApp;
        if (!tg || !tg.initDataUnsafe?.user) {
          throw new Error('请在Telegram中打开此应用！');
        }
        const telegramUser = {
          id: tg.initDataUnsafe.user.id,
          username: tg.initDataUnsafe.user.username || '未知用户'
        };
        setUser(telegramUser);

        // 2. 初始化数据库用户（防刷基础）
        await initUserInDB(telegramUser);

        // 3. 获取累计樱桃数+今日次数（防刷校验）
        const [total, counts] = await Promise.all([
          getTotalCherries(telegramUser),
          getUserDailyCounts(telegramUser)
        ]);
        setTotalCherries(total);
        setDailyCounts(counts);
      } catch (error) {
        alert(`初始化失败：${error.message}`);
        console.error('防刷初始化失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // 更新累计樱桃数
  const handleUpdateTotalCherries = (newTotal) => {
    setTotalCherries(newTotal);
    // 同步更新今日已摘次数
    setDailyCounts(prev => ({
      ...prev,
      todayPickedCount: prev.todayPickedCount + 1
    }));
  };

  // 看广告增加次数（带数据库防刷）
  const handleWatchAd = async () => {
    if (isLoading || !user) return;
    setIsLoading(true);

    try {
      alert(`🎬 正在播放广告...（5秒后关闭）\n广告完成后可额外采摘${CONFIG.AD_REWARD_TIMES}次！`);
      // 模拟广告播放
      await new Promise(resolve => setTimeout(resolve, 5000));

      // 数据库层面更新广告次数（带防刷校验）
      const adResult = await watchAdAddPickTimes(user);
      
      // 更新前端状态
      setDailyCounts(prev => ({
        ...prev,
        todayAdCount: adResult.adCount,
        extraPickTimes: adResult.extraPickTimes
      }));

      alert(`✅ 广告看完啦！\n今日已看${adResult.adCount}/${CONFIG.MAX_AD_COUNT}次广告，额外获得${CONFIG.AD_REWARD_TIMES}次采摘机会～`);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#0f172a'
      }}>
        <div style={{ fontSize: 20, color: '#e5e7eb' }}>加载中...（防刷校验中）</div>
      </div>
    );
  }

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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <SkyBar
        totalCherries={totalCherries}
        onWatchAd={handleWatchAd}
        isLoading={isLoading}
      />

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
          margin: '20px 10px 0',
        }}
      >
        <CherryTree
          user={user}
          totalCherries={totalCherries}
          basePickTimes={CONFIG.BASE_PICK_TIMES}
          dailyCounts={dailyCounts}
          onUpdateTotalCherries={handleUpdateTotalCherries}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}