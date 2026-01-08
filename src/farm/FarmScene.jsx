import SkyBar from './SkyBar';
import CherryTree from './CherryTree';

export default function FarmScene() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a', // 深色背景
        color: '#e5e7eb',
        paddingBottom: 40,
      }}
    >
      {/* 顶部导航栏 */}
      <SkyBar />

      {/* 核心采摘区域 */}
      <div
        style={{
          height: 'calc(100vh - 60px)',
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