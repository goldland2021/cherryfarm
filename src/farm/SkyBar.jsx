// src/farm/SkyBar.jsx
export default function SkyBar({ totalCherries, onWatchAdGetCherry }) {
  return (
    <div
      style={{
        height: 56,
        backgroundColor: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between', // 两端对齐
        padding: '0 16px', // 调整内边距适配按钮
        borderBottom: '1px solid #334155',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* 左侧：标题 */}
      <h1 style={{ color: '#f87171', margin: 0, fontSize: 22, fontWeight: 600 }}>🍒 樱桃农场</h1>
      
      {/* 右侧：樱桃数 + 广告按钮 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* 樱桃数量 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: '#f87171',
          fontSize: 18,
          fontWeight: 500
        }}>
          <span>🍒</span>
          <span>{totalCherries}</span>
        </div>
        
        {/* 看广告得樱桃按钮 */}
        <button
          onClick={onWatchAdGetCherry}
          style={{
            padding: '6px 12px',
            fontSize: 14,
            borderRadius: 16,
            backgroundColor: '#f59e0b', // 橙色（广告按钮常用色）
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.3s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => e.target.style.opacity = 0.9}
          onMouseLeave={(e) => e.target.style.opacity = 1}
        >
          看广告得樱桃
        </button>
      </div>
    </div>
  );
}