import { useState, useEffect } from 'react';
// 导入子组件
import SkyBar from './SkyBar';
import CherryTree from './CherryTree';
// 导入农场背景图（路径请根据实际存放位置调整）
import FarmBg from '../assets/farm-bg.png';
// 导入Supabase客户端（仅用于读取累计樱桃数）
import { supabase } from '../lib/supabaseClient';

export default function FarmScene() {
  // 核心状态
  const [user, setUser] = useState(null); // Telegram用户信息
  const [totalCherries, setTotalCherries] = useState(0); // 累计樱桃数
  const [adCountToday, setAdCountToday] = useState(0); // 今日已看广告次数
  const [extraPickTimes, setExtraPickTimes] = useState(0); // 广告额外可采摘次数

  // 配置常量（可按需调整）
  const CONFIG = {
    BASE_PICK_TIMES: 5, // 每日基础可采摘次数
    MAX_AD_COUNT: 3, // 每日最多看广告次数
    AD_REWARD_TIMES: 1, // 每次广告奖励的采摘次数
    LOCAL_STORAGE_KEY: 'cherry_farm_ad_data' // 本地存储广告数据的key
  };

  // 初始化：读取用户信息、累计樱桃数、今日广告数据
  useEffect(() => {
    // 1. 获取Telegram Mini App用户信息
    const getTelegramUser = () => {
      const tg = window.Telegram?.WebApp;
      if (tg && tg.initDataUnsafe?.user) {
        const telegramUser = {
          id: tg.initDataUnsafe.user.id,
          username: tg.initDataUnsafe.user.username || '未知用户'
        };
        setUser(telegramUser);
        // 获取用户累计樱桃数（统计cherry_picks表记录数）
        getTotalCherries(telegramUser);
      } else {
        alert('⚠️ 请在Telegram中打开此应用！');
      }
    };

    // 2. 读取用户累计樱桃数
    const getTotalCherries = async (userInfo) => {
      try {
        const { count, error } = await supabase
          .from('cherry_picks')
          .select('id', { head: true, count: 'exact' })
          .eq('user_id', userInfo.id);
        if (error) throw error;
        setTotalCherries(count || 0);
      } catch (error) {
        console.error('获取累计樱桃数失败:', error);
        setTotalCherries(0);
      }
    };

    // 3. 读取今日广告数据（本地存储，无需同步数据库）
    const getAdDataFromLocal = () => {
      const today = new Date().toLocaleDateString();
      const savedData = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
      
      if (savedData) {
        const { date, adCount, extraTimes } = JSON.parse(savedData);
        // 仅当日期为今日时，恢复广告数据
        if (date === today) {
          setAdCountToday(adCount);
          setExtraPickTimes(extraTimes);
        }
      }
    };

    // 执行初始化逻辑
    getTelegramUser();
    getAdDataFromLocal();
  }, []);

  // 更新累计樱桃数的回调（供CherryTree组件调用）
  const handleUpdateTotalCherries = (newTotal) => {
    setTotalCherries(newTotal);
  };

  // 看广告增加可采摘次数的核心逻辑
  const handleWatchAd = () => {
    // 前置校验
    if (!user) {
      alert('⚠️ 请先登录Telegram账号！');
      return;
    }
    if (adCountToday >= CONFIG.MAX_AD_COUNT) {
      alert(`📢 今日已看${CONFIG.MAX_AD_COUNT}次广告，明天再来吧～`);
      return;
    }

    // MVP阶段：模拟广告播放（5秒）
    alert(`🎬 正在播放广告...（5秒后关闭）\n广告完成后可额外采摘${CONFIG.AD_REWARD_TIMES}次！`);
    
    setTimeout(() => {
      // 计算新的广告次数和额外采摘次数
      const newAdCount = adCountToday + 1;
      const newExtraTimes = extraPickTimes + CONFIG.AD_REWARD_TIMES;
      
      // 更新状态
      setAdCountToday(newAdCount);
      setExtraPickTimes(newExtraTimes);
      
      // 保存到本地存储（每日自动重置）
      const today = new Date().toLocaleDateString();
      localStorage.setItem(
        CONFIG.LOCAL_STORAGE_KEY,
        JSON.stringify({
          date: today,
          adCount: newAdCount,
          extraTimes: newExtraTimes
        })
      );
      
      // 广告完成提示
      alert(`✅ 广告看完啦！\n额外获得${CONFIG.AD_REWARD_TIMES}次采摘机会，今日最多可摘${CONFIG.BASE_PICK_TIMES + newExtraTimes}次～`);
    }, 5000); // 模拟5秒广告时长
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        // 背景图样式
        backgroundImage: `url(${FarmBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        // 半透明遮罩，提升内容可读性
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backgroundBlendMode: 'overlay',
        // 布局样式
        color: '#e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* 顶部导航栏 */}
      <SkyBar
        totalCherries={totalCherries}
        onWatchAd={handleWatchAd}
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
          // 半透明背景，突出内容
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          borderRadius: 16,
          margin: '20px 10px 0',
        }}
      >
        <CherryTree
          user={user}
          totalCherries={totalCherries}
          basePickTimes={CONFIG.BASE_PICK_TIMES}
          extraPickTimes={extraPickTimes}
          onUpdateTotalCherries={handleUpdateTotalCherries}
        />
      </div>
    </div>
  );
}