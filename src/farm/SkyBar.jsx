// src/farm/SkyBar.jsx
export default function SkyBar({ totalCherries }) {
  return (
    <div
      style={{
        height: 56,
        backgroundColor: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between', // 两端对齐（标题+樱桃数）
        padding: '0 20px', // 左右留白
        borderBottom: '1px solid #334155',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* 左侧标题 */}
      <h1 style={{ color: '#f87171', margin: 0, fontSize: 22, fontWeight: 600 }}>🍒 </h1>
      
      {/* 右侧：显示累计樱桃数 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        color: '#f87171',
        fontSize: 18,
        fontWeight: 500
      }}>
        <span></span>
        <span>{totalCherries}</span>
      </div>
    </div>
  );
}