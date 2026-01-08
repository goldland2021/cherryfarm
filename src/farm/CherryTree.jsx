import { useEffect, useState } from 'react';
// 导入樱桃服务（采摘、统计逻辑）
import { getTodayPickedCount, pickCherry } from '../lib/cherryService';
// 导入樱桃树图片（路径请根据实际存放位置调整）
import CherryTreeImg from '../assets/cherry-tree.png';

/**
 * 樱桃树采摘组件
 * @param {object} user Telegram用户信息 { id, username }
 * @param {number} totalCherries 累计樱桃数
 * @param {number} basePickTimes 每日基础可采摘次数
 * @param {number} extraPickTimes 广告额外可采摘次数
 * @param {Function} onUpdateTotalCherries 更新累计樱桃数的回调
 */
export default function CherryTree({
  user,
  totalCherries,
  basePickTimes,
  extraPickTimes,
  onUpdateTotalCherries
}) {
  // 今日已采摘次数
  const [todayPickedCount, setTodayPickedCount] = useState(0);
  // 加载状态
  const [isLoading, setIsLoading] = useState(false);
  // 今日可采摘总上限 = 基础次数 + 广告额外次数
  const maxPickTimes = basePickTimes + extraPickTimes;

  // 初始化：加载用户今日已采摘次数
  useEffect(() => {
    if (!user) return;

    const loadTodayPickedCount = async () => {
      setIsLoading(true);
      try {
        // 调用服务获取今日已摘次数
        const count = await getTodayPickedCount(user);
        setTodayPickedCount(count);
      } catch (error) {
        console.error('加载今日采摘次数失败:', error);
        alert('⚠️ 加载数据失败，请刷新重试');
      } finally {
        setIsLoading(false);
      }
    };

    loadTodayPickedCount();
  }, [user]);

  // 采摘樱桃按钮点击事件
  const handlePickCherry = async () => {
    // 禁用条件：加载中、无用户、今日已摘满
    if (isLoading || !user || todayPickedCount >= maxPickTimes) return;

    setIsLoading(true);
    try {
      // 调用采摘逻辑，获取最新累计樱桃数
      const newTotal = await pickCherry(user);
      // 更新今日已摘次数
      setTodayPickedCount(prev => prev + 1);
      // 通知父组件更新累计樱桃数（同步到顶部）
      onUpdateTotalCherries(newTotal);
      // 采摘成功提示
      alert('✅ 采摘成功！收获1个樱桃～');
    } catch (error) {
      alert(`❌ 采摘失败：${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 加载中/无用户状态UI
  if (!user || isLoading) {
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

  // 判断是否可采摘
  const canPick = todayPickedCount < maxPickTimes;

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
          transition: 'transform 0.5s ease',
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      />
      
      {/* 今日采摘次数提示（含广告额外次数说明） */}
      <div style={{
        fontSize: 18,
        margin: 8,
        color: '#e5e7eb',
        backgroundColor: 'rgba(51, 65, 85, 0.5)',
        padding: '8px 20px',
        borderRadius: 20,
        display: 'inline-block',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      }}>
        今日可摘: {todayPickedCount}/{maxPickTimes} 次
        {/* 有额外次数时显示标注 */}
        {extraPickTimes > 0 && (
          <span style={{ color: '#f59e0b', marginLeft: 8, fontWeight: 500 }}>
            （含{extraPickTimes}次广告奖励）
          </span>
        )}
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
          boxShadow: canPick ? '0 4px 12px rgba(220, 38, 38, 0.4)' : 'none',
        }}
        onMouseEnter={(e) => canPick && (e.target.style.transform = 'scale(1.02)')}
        onMouseLeave={(e) => canPick && (e.target.style.transform = 'scale(1)')}
      >
        {todayPickedCount >= maxPickTimes ? '今日已摘完' : '摘樱桃'}
      </button>
    </div>
  );
}