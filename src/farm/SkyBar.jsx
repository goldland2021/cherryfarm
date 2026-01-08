// src/farm/SkyBar.jsx
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
      }}
    >
      <h1 style={{ color: '#f87171', margin: 0, fontSize: 22, fontWeight: 600 }}>🍒 樱桃农场</h1>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* 累计樱桃数 */}
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
        
        {/* 广告按钮：文字调整为“看广告加次数” */}
        <button
          onClick={onWatchAd}
          style={{
            padding: '6px 12px',
            fontSize: 14,
            borderRadius: 16,
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.3s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => e.target.style.opacity = 0.9}
          onMouseLeave={(e) => e.target.style.opacity = 1}
        >
          看广告加次数
        </button>
      </div>
    </div>
  );
}