import { useEffect, useState } from 'react';
import { pickCherry, getUserDailyCounts } from '../lib/cherryService';
import CherryTreeImg from '../assets/cherry-tree.png';

export default function CherryTree({
  user,
  totalCherries,
  basePickTimes,
  dailyCounts,
  onUpdateTotalCherries,
  isLoading
}) {
  const [localCounts, setLocalCounts] = useState(dailyCounts);
  const [btnLoading, setBtnLoading] = useState(false);

  // 同步数据库次数
  useEffect(() => {
    setLocalCounts(dailyCounts);
  }, [dailyCounts]);

  // 今日可采摘总上限（数据库防刷锁控制）
  const maxPickTimes = localCounts.maxDailyPick;
  
  // 关键修复：每次判断可采摘前，用最新的数据库次数（而非本地缓存）
  const checkCanPick = async () => {
    if (isLoading || btnLoading || !user) return false;
    const latestCounts = await getUserDailyCounts(user);
    setLocalCounts(latestCounts); // 同步最新状态
    return latestCounts.todayPickedCount < latestCounts.maxDailyPick;
  };

  // 采摘逻辑（带实时校验）
  const handlePickCherry = async () => {
    // 第一步：先校验最新状态
    const canPick = await checkCanPick();
    if (!canPick) {
      alert(`今日已达最大采摘次数（${maxPickTimes}次），明天再来吧！`);
      return;
    }

    setBtnLoading(true);
    try {
      const newTotal = await pickCherry(user);
      onUpdateTotalCherries(newTotal);
      // 第二步：采摘后立即同步最新次数
      const latestCounts = await getUserDailyCounts(user);
      setLocalCounts(latestCounts);
      alert('✅ 采摘成功！收获1个樱桃～');
    } catch (error) {
      alert(error.message);
      // 失败后也同步最新次数，确保按钮状态正确
      const latestCounts = await getUserDailyCounts(user);
      setLocalCounts(latestCounts);
    } finally {
      setBtnLoading(false);
    }
  };

  // 关键修复：页面加载/广告次数变化时，主动校验最新状态
  useEffect(() => {
    if (user) {
      checkCanPick();
    }
  }, [user, dailyCounts]);

  if (isLoading || !user) {
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

  // 最终可采摘状态（基于最新的本地同步数据）
  const canPickFinal = localCounts.todayPickedCount < maxPickTimes;

  return (
    <div style={{ textAlign: 'center', padding: 20, width: '100%', maxWidth: '400px' }}>
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
      
      {/* 实时显示数据库中的次数 */}
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
        今日可摘: {localCounts.todayPickedCount}/{maxPickTimes} 次
        {localCounts.extraPickTimes > 0 && (
          <span style={{ color: '#f59e0b', marginLeft: 8, fontWeight: 500 }}>
            （含{localCounts.extraPickTimes}次广告奖励）
          </span>
        )}
      </div>

      <button
        onClick={handlePickCherry}
        disabled={!canPickFinal || btnLoading} // 基于最新状态禁用
        style={{
          padding: '16px 36px',
          fontSize: 22,
          borderRadius: 24,
          cursor: canPickFinal ? 'pointer' : 'not-allowed',
          backgroundColor: canPickFinal ? '#dc2626' : '#64748b',
          color: 'white',
          border: 'none',
          transition: 'all 0.3s ease',
          marginTop: 30,
          width: '100%',
          boxShadow: canPickFinal ? '0 4px 12px rgba(220, 38, 38, 0.4)' : 'none',
          opacity: btnLoading ? 0.8 : 1,
        }}
      >
        {btnLoading ? '采摘中...' : (localCounts.todayPickedCount >= maxPickTimes ? '今日已摘完' : '摘樱桃')}
      </button>
    </div>
  );
}