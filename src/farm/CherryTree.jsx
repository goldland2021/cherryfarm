import { useEffect, useState } from 'react';
import { useTelegramUser } from '../lib/useTelegramUser';
import { getTodayPickedCount, hasReachedDailyLimit, getTotalCherries, pickCherry } from '../lib/cherryService';
// 导入你的樱桃树图片（路径请根据实际存放位置调整）
import CherryTreeImg from '../assets/cherry-tree.png';

/**
 * 樱桃树核心组件（采摘功能）
 * @param {number} totalCherries 父组件传递的累计樱桃数
 * @param {Function} onUpdateTotalCherries 通知父组件更新樱桃数的回调
 */
export default function CherryTree({ totalCherries, onUpdateTotalCherries }) {
  // 获取Telegram用户信息
  const { user, isLoading: isLoadingUser } = useTelegramUser();
  
  // 本地状态：今日已采摘次数、加载状态
  const [todayPickedCount, setTodayPickedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 挂载用户信息到window，供广告逻辑更新Supabase使用（MVP临时方案）
  useEffect(() => {
    if (user) {
      window.userInfo = user;
    }
  }, [user]);

  // 初始化：加载今日采摘次数和累计樱桃数，同步到父组件
  useEffect(() => {
    if (!user || isLoadingUser) return;

    const loadCherryData = async () => {
      setIsLoading(true);
      try {
        // 并行获取今日采摘次数和累计樱桃数
        const [todayCount, initTotal] = await Promise.all([
          getTodayPickedCount(user),
          getTotalCherries(user)
        ]);
        
        // 更新本地今日采摘次数
        setTodayPickedCount(todayCount);
        // 同步初始累计数到父组件（顶部显示）
        onUpdateTotalCherries(initTotal);
      } catch (error) {
        console.error('加载樱桃数据失败:', error);
        alert('⚠️ 加载数据失败，请刷新重试');
      } finally {
        setIsLoading(false);
      }
    };

    loadCherryData();
  }, [user, isLoadingUser, onUpdateTotalCherries]);

  // 采摘樱桃按钮点击事件
  const handlePickCherry = async () => {
    // 防重复点击、未登录、今日已达上限时禁用
    if (isLoading || !user || todayPickedCount >= 5) return;

    setIsLoading(true);
    try {
      // 调用采摘逻辑，获取最新累计数
      const newTotal = await pickCherry(user);
      
      // 更新今日采摘次数
      setTodayPickedCount(prev => prev + 1);
      // 通知父组件更新累计数（顶部显示）
      onUpdateTotalCherries(newTotal);
      
      // 采摘成功提示
      alert('✅ 采摘成功！收获1个樱桃～');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 加载中状态UI
  if (isLoadingUser || isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 20 }}>
        <img
          src={CherryTreeImg}
          alt="樱桃树"
          style={{ 
            width: '280px', 
            height: 'auto', 
            marginBottom: 20, 
            opacity: 0.7,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
          }}
        />
        <div style={{ fontSize: 18, marginTop: 12, color: '#94a3b8' }}>加载中...</div>
      </div>
    );
  }

  // 判断是否可采摘（今日未达5次 + 用户已登录）
  const canPick = todayPickedCount < 5 && !!user;

  // 主UI渲染
  return (
    <div style={{ textAlign: 'center', padding: 20, width: '100%', maxWidth: '400px' }}>
      {/* 卡通樱桃树图片（替换原emoji） */}
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