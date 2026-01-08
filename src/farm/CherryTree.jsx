import { useEffect, useState } from 'react';
import { useTelegramUser } from '../lib/useTelegramUser';
import { getTodayPickedCount, hasReachedDailyLimit, getTotalCherries, pickCherry } from '../lib/cherryService';

export default function CherryTree() {
  // 获取 Telegram 用户信息
  const { user, isLoading: isLoadingUser } = useTelegramUser();
  
  // 本地状态
  const [totalCherries, setTotalCherries] = useState(0); // 累计樱桃数
  const [todayPickedCount, setTodayPickedCount] = useState(0); // 今日已摘次数
  const [isLoading, setIsLoading] = useState(false); // 操作加载状态

  // 初始化加载数据
  useEffect(() => {
    if (!user || isLoadingUser) return;

    const loadCherryData = async () => {
      setIsLoading(true);
      try {
        // 并行请求，提升加载速度
        const [todayCount, totalCount] = await Promise.all([
          getTodayPickedCount(user),
          getTotalCherries(user)
        ]);
        setTodayPickedCount(todayCount);
        setTotalCherries(totalCount);
      } catch (error) {
        console.error('加载樱桃数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCherryData();
  }, [user, isLoadingUser]);

  // 采摘樱桃按钮点击事件
  const handlePickCherry = async () => {
    if (isLoading || !user || todayPickedCount >= 5) return;

    setIsLoading(true);
    try {
      const newTotal = await pickCherry(user);
      // 更新状态
      setTotalCherries(newTotal);
      setTodayPickedCount(prev => prev + 1);
      alert('✅ 采摘成功！收获1个樱桃～');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 加载中状态
  if (isLoadingUser || isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 20 }}>
        <div style={{ fontSize: 48 }}>🌳</div>
        <div style={{ fontSize: 18, marginTop: 12, color: '#94a3b8' }}>加载中...</div>
      </div>
    );
  }

  // 是否可采摘
  const canPick = todayPickedCount < 5 && !!user;

  return (
    <div style={{ textAlign: 'center', padding: 20 }}>
      <div style={{ fontSize: 64 }}>🌳</div>
      
      {/* 累计樱桃数 */}
      <div style={{ fontSize: 28, margin: 16, color: '#f87171', fontWeight: 'bold' }}>
        🍒 累计樱桃: {totalCherries}
      </div>
      
      {/* 今日采摘次数提示 */}
      <div style={{ fontSize: 18, margin: 8, color: '#94a3b8' }}>
        今日已摘: {todayPickedCount}/5 次
      </div>

      {/* 采摘按钮 */}
      <button
        onClick={handlePickCherry}
        disabled={!canPick}
        style={{
          padding: '14px 32px',
          fontSize: 20,
          borderRadius: 16,
          cursor: canPick ? 'pointer' : 'not-allowed',
          backgroundColor: canPick ? '#dc2626' : '#64748b',
          color: 'white',
          border: 'none',
          transition: 'background-color 0.3s ease',
          marginTop: 20,
        }}
      >
        {todayPickedCount >= 5 ? '今日已摘5次' : '摘樱桃'}
      </button>
    </div>
  );
}