// src/components/FarmScene.jsx
import { useState, useEffect } from 'react';
import SkyBar from './SkyBar';
import CherryTree from './CherryTree';
import FarmBg from '../assets/farm-bg.png';
import { getTotalCherries, CONFIG } from '../lib/cherryService';

// 纯业务组件：农场樱桃采摘场景，不再包含登录逻辑
// 接收从TgLogin透传的user和isLoading（登录状态）
export default function FarmScene({ user, isLoading: loginLoading }) {
  // 仅保留业务相关状态：累计樱桃数（登录状态由外部传入）
  const [totalCherries, setTotalCherries] = useState(0);
  // 业务加载状态：仅控制自身业务（如获取樱桃数），与登录加载分离
  const [bizLoading, setBizLoading] = useState(true);

  // 业务初始化：依赖传入的user，用户登录成功后再执行（核心修改）
  useEffect(() => {
    // 若用户未登录/登录中，直接返回
    if (loginLoading || !user) return;

    // 封装业务初始化逻辑：仅获取累计樱桃数（原登录后的业务逻辑）
    const initFarmBiz = async () => {
      try {
        const total = await getTotalCherries(user);
        setTotalCherries(total);
      } catch (error) {
        alert(`农场初始化失败：${error.message}`);
        console.error('樱桃数获取失败：', error);
      } finally {
        setBizLoading(false);
      }
    };

    initFarmBiz();
  }, [user, loginLoading]); // 依赖user和loginLoading，登录状态变化时重新执行

  // 合并加载状态：登录加载 + 业务加载，任一未完成则展示加载中
  const isLoading = loginLoading || bizLoading;

  // 更新累计樱桃数：原逻辑不变，子组件回调同步数据
  const handleUpdateTotalCherries = (newTotal) => {
    setTotalCherries(newTotal);
  };

  // 看广告解锁采摘上限：原逻辑不变，仅校验合并后的isLoading
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
      CONFIG.DAILY_PICK_LIMIT = 10 + newAdCount;
      alert(`广告完成！今日可摘上限变为${CONFIG.DAILY_PICK_LIMIT}次～`);
    }, 5000);
  };

  // 加载中：原逻辑不变，合并加载状态控制
  if (isLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', color: '#e5e7eb' }}>农场加载中...</div>;
  }

  // 业务渲染：原逻辑完全不变，仅使用传入的user
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