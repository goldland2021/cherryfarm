// src/farm/CherryTree.jsx
import { useEffect, useState } from 'react';
import { useTelegramUser } from '../lib/useTelegramUser';
import { getTodayPickedCount, hasReachedDailyLimit, getTotalCherries, pickCherry } from '../lib/cherryService';
// 导入你的樱桃树图片
import CherryTreeImg from '../assets/cherry-tree.png';

// 接收父组件传递的totalCherries和更新函数
export default function CherryTree({ totalCherries, onUpdateTotalCherries }) {
  const { user, isLoading: isLoadingUser } = useTelegramUser();
  const [todayPickedCount, setTodayPickedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 初始化：加载樱桃数并同步到父组件
  useEffect(() => {
    if (!user || isLoadingUser) return;

    const loadCherryData = async () => {
      setIsLoading(true);
      try {
        const [todayCount, initTotal] = await Promise.all([
          getTodayPickedCount(user),
          getTotalCherries(user)
        ]);
        setTodayPickedCount(todayCount);
        // 初始化时同步到父组件
        onUpdateTotalCherries(initTotal);
      } catch (error) {
        console.error('加载樱桃数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCherryData();
  }, [user, isLoadingUser, onUpdateTotalCherries]);

  const handlePickCherry = async () => {
    if (isLoading || !user || todayPickedCount >= 5) return;

    setIsLoading(true);
    try {
      const newTotal = await pickCherry(user);
      // 采摘后更新父组件的樱桃数
      onUpdateTotalCherries(newTotal);
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
        <img
          src={CherryTreeImg}
          alt="樱桃树"
          style={{ width: '280px', height: 'auto', marginBottom: 20, opacity: 0.7 }}
        />
        <div style={{ fontSize: 18, marginTop: 12, color: '#94a3b8' }}>加载中...</div>
      </div>
    );
  }

  const canPick = todayPickedCount < 5 && !!user;

  return (
    <div style={{ textAlign: 'center', padding: 20, width: '100%', maxWidth: '400px' }}>
      {/* 卡通樱桃树图片 */}
      <img
        src={CherryTreeImg}
        alt="挂满樱桃的树"
        style={{
          width: '280px',
          height: 'auto',
          marginBottom: 20,
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
        }}
      />
      
      {/* 今日采摘次数提示 */}
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

      {/* 采摘按钮 */}
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