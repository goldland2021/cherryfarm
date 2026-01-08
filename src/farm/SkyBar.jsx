export default function SkyBar() {
  return (
    <div
      style={{
        height: 56,
        backgroundColor: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid #334155',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)', // 增加轻微阴影，提升层次感
      }}
    >
      <h1 style={{ color: '#f87171', margin: 0, fontSize: 22, fontWeight: 600 }}>🍒 樱桃农场</h1>
    </div>
  );
}