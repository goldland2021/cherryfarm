import { useEffect, useState } from 'react';
import { useTelegramUser } from '../lib/useTelegramUser';
import { hasPickedToday, getTotalCherries, pickCherry } from '../lib/cherryService';

export default function CherryTree() {
  // 获取 Telegram 用户信息
  const { user, isLoading: isLoadingUser } = useTelegramUser();
  // 本地状态管理
  const [totalCherries, setTotalCherries] = useState(0);
  const [hasPicked, setHasPicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 初始化：加载采摘状态和总樱桃数
  useEffect(() => {
    if (!user || isLoadingUser) return;

    const loadCherryData = async () => {
      setIsLoading(true);
      try {
        // 并行请求，提升性能
        const [pickedStatus, totalCount] = await Promise.all([
          hasPickedToday(user),
          getTotalCherries(user)
        ]);
        setHasPicked(pickedStatus);
        setTotalCherries(totalCount);
      } catch (error) {
        console.error('加载樱桃数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCherryData();
  }, [user, isLoadingUser]);

  // 处理采摘樱桃逻辑
  const handlePickCherry = async () => {
    if (isLoading || hasPicked || !user) return;

    setIsLoading(true);
    try {
      const newTotal = await pickCherry(user);
      setTotalCherries(newTotal);
      setHasPicked(true);
      alert('采摘成功！🍒');
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

  return (
    <div style={{ textAlign: 'center', padding: 20 }}>
      <div style={{ fontSize: 48 }}>🌳</div>
      <div style={{ fontSize: 24, margin: 12, color: '#f87171' }}>
        🍒 樱桃数: {totalCherries}
      </div>

      <button
        onClick={handlePickCherry}
        disabled={hasPicked || !user}
        style={{
          padding: '12px 24px',
          fontSize: 18,
          borderRadius: 12,
          cursor: hasPicked ? 'not-allowed' : 'pointer',
          backgroundColor: hasPicked ? '#64748b' : '#dc2626',
          color: 'white',
          border: 'none',
          transition: 'background-color 0.2s',
        }}
      >
        {hasPicked ? '今日已摘' : '摘樱桃'}
      </button>
    </div>
  );
}