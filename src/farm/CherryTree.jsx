import { useEffect, useState } from 'react';
import { getTodayPickedCount, pickCherry, CONFIG } from '../lib/cherryService';
import CherryTreeImg from '../assets/cherry-tree.png';

export default function CherryTree({ user, onUpdateTotalCherries }) {
  const [todayPickedCount, setTodayPickedCount] = useState(0);
  const [btnLoading, setBtnLoading] = useState(false);

  // 初始化今日已摘次数
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const count = await getTodayPickedCount(user);
      setTodayPickedCount(count);
    };
    load();
  }, [user]);

  // 采摘逻辑
  const handlePickCherry = async () => {
    if (btnLoading || todayPickedCount >= CONFIG.DAILY_PICK_LIMIT) return;
    setBtnLoading(true);
    try {
      const newTotal = await pickCherry(user);
      onUpdateTotalCherries(newTotal);
      setTodayPickedCount(prev => prev + 1);
      alert('采摘成功！！收了1个樱桃～');
    } catch (error) {
      alert(error.message);
    } finally {
      setBtnLoading(false);
    }
  };

  if (!user) {
    return <div style={{ textAlign: 'center', padding: 20 }}>请登录Telegram</div>;
  }

  const canPick = todayPickedCount < CONFIG.DAILY_PICK_LIMIT;

  return (
    <div style={{ textAlign: 'center', padding: 20, maxWidth: '400px' }}>
      <img
        src={CherryTreeImg}
        alt="樱桃树"
        style={{ width: '280px', height: 'auto', marginBottom: 20, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
      />
      <div style={{
        fontSize: 18,
        margin: 8,
        color: '#e5e7eb',
        backgroundColor: 'rgba(51, 65, 85, 0.5)',
        padding: '8px 20px',
        borderRadius: 20,
        display: 'inline-block',
      }}>
        今日已摘: {todayPickedCount}/{CONFIG.DAILY_PICK_LIMIT} 次
      </div>
      <button
        onClick={handlePickCherry}
        disabled={!canPick || btnLoading}
        style={{
          padding: '16px 36px',
          fontSize: 22,
          borderRadius: 24,
          backgroundColor: canPick ? '#dc2626' : '#64748b',
          color: 'white',
          border: 'none',
          marginTop: 30,
          width: '100%',
        }}
      >
        {btnLoading ? '采摘中...' : (canPick ? '摘樱桃' : '今日已摘完')}
      </button>
    </div>
  );
}