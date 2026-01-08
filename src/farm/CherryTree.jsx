import { useEffect, useState } from 'react';
import { useTelegramUser } from '../lib/useTelegramUser';
import { getTodayPickedCount, hasReachedDailyLimit, getTotalCherries, pickCherry } from '../lib/cherryService';

export default function CherryTree() {
  // 业务逻辑完全不变
  const { user, isLoading: isLoadingUser } = useTelegramUser();
  const [totalCherries, setTotalCherries] = useState(0);
  const [todayPickedCount, setTodayPickedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user || isLoadingUser) return;

    const loadCherryData = async () => {
      setIsLoading(true);
      try {
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

  const handlePickCherry = async () => {
    if (isLoading || !user || todayPickedCount >= 5) return;

    setIsLoading(true);
    try {
      const newTotal = await pickCherry(user);
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
        <div style={{ fontSize: 64 }}>🌳</div>
        <div style={{ fontSize: 18, marginTop: 12, color: '#94a3b8' }}>加载中...</div>
      </div>
    );
  }

  const canPick = todayPickedCount < 5 && !!user;

  return (
    <div style={{ textAlign: 'center', padding: 20, width: '100%', maxWidth: '400px' }}>
      {/* 樱桃树图标（放大+优化样式） */}
      <div style={{ fontSize: 80, marginBottom: 20, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>
        🌳
      </div>
      
      {/* 累计樱桃数（突出显示） */}
      <div style={{ 
        fontSize: 32, 
        margin: 16, 
        color: '#f87171', 
        fontWeight: 'bold',
        textShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
        🍒 累计樱桃: {totalCherries}
      </div>
      
      {/* 今日采摘次数提示（简洁样式） */}
      <div style={{ 
        fontSize: 18, 
        margin: 8, 
        color: '#94a3b8',
        backgroundColor: 'rgba(51, 65, 85, 0.3)',
        padding: '6px 16px',
        borderRadius: 20,
        display: 'inline-block'
      }}>
        今日已摘: {todayPickedCount}/5 次
      </div>

      {/* 采摘按钮（优化样式，提升点击体验） */}
      <button
        onClick={handlePickCherry}
        disabled={!canPick}
        style={{
          padding: '16px 36px',
          fontSize: 22,
          borderRadius: 24,
          cursor: canPick ? 'pointer' : 'not-allowed',
          backgroundColor: canPick ? '#dc2626' : '#64748b',
          color: 'white',
          border: 'none',
          transition: 'all 0.3s ease',
          marginTop: 30,
          width: '100%',
          boxShadow: canPick ? '0 4px 12px rgba(220, 38, 38, 0.4)' : 'none'
        }}
      >
        {todayPickedCount >= 5 ? '今日已摘5次' : '摘樱桃'}
      </button>
    </div>
  );
}