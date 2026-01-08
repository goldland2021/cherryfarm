/**
 * 顶部导航栏组件
 * @param {number} totalCherries 累计樱桃数
 * @param {Function} onWatchAd 看广告按钮点击事件
 */
export default function SkyBar({ totalCherries, onWatchAd }) {
  return (
    <div
      style={{
        height: 56,
        backgroundColor: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: '1px solid #334155',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 100, // 确保导航栏在最上层
      }}
    >
      {/* 左侧标题 */}
      <h1 style={{ color: '#f87171', margin: 0, fontSize: 22, fontWeight: 600 }}>🍒 樱桃农场</h1>
      
      {/* 右侧：樱桃数 + 广告按钮 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* 累计樱桃数展示 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: '#f87171',
          fontSize: 18,
          fontWeight: 500,
          backgroundColor: 'rgba(248, 113, 113, 0.1)',
          padding: '4px 10px',
          borderRadius: 12,
        }}>
          <span>🍒</span>
          <span>{totalCherries}</span>
        </div>
        
        {/* 看广告加采摘次数按钮 */}
        <button
          onClick={onWatchAd}
          style={{
            padding: '6px 12px',
            fontSize: 14,
            borderRadius: 16,
            backgroundColor: '#f59e0b', // 橙色突出广告按钮
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
          onMouseEnter={(e) => {
            e.target.style.opacity = 0.9;
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.opacity = 1;
            e.target.style.transform = 'scale(1)';
          }}
        >
          看广告加次数
        </button>
      </div>
    </div>
  );
}