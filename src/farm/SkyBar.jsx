export default function SkyBar({ totalCherries, onWatchAd, isLoading }) {
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
        zIndex: 100,
      }}
    >
      <h1 style={{ color: '#f87171', margin: 0, fontSize: 22, fontWeight: 600 }}>🍒 樱桃农场</h1>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
        
        <button
          onClick={onWatchAd}
          disabled={isLoading}
          style={{
            padding: '6px 12px',
            fontSize: 14,
            borderRadius: 16,
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? '加载中...' : '看广告加次数'}
        </button>
      </div>
    </div>
  );
}