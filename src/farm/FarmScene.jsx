import SkyBar from './SkyBar';
import CherryTree from './CherryTree';

export default function FarmScene() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a', // 深色背景（更聚焦内容）
        color: '#e5e7eb',
        paddingBottom: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* 顶部导航栏（无天气时间） */}
      <SkyBar />

      {/* 核心采摘区域（居中+限制宽度，适配不同屏幕） */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          padding: '20px',
        }}
      >
        <CherryTree />
      </div>
    </div>
  );
}