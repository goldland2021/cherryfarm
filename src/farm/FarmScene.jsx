import SkyBar from './SkyBar';
import CherryTree from './CherryTree';
// ❌ 暂时不用的保留注释
// import CherryBasket.jsx
// import FarmStatusSign.jsx
// import FarmHut.jsx

export default function FarmScene() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#e5e7eb',
        paddingBottom: 40,
      }}
    >
      <SkyBar />

      {/* 主视觉区 */}
      <div
        style={{
          height: 360,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CherryTree />
      </div>
    </div>
  );
}