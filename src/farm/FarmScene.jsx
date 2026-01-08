// src/farm/FarmScene.jsx
import { useState } from 'react';
import SkyBar from './SkyBar';
import CherryTree from './CherryTree';

export default function FarmScene() {
  // 状态提升：在父组件管理累计樱桃数，传递给SkyBar和CherryTree
  const [totalCherries, setTotalCherries] = useState(0);

  // 接收CherryTree传递来的新樱桃数
  const handleUpdateTotalCherries = (newTotal) => {
    setTotalCherries(newTotal);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#e5e7eb',
        paddingBottom: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* 顶部导航栏：传递累计樱桃数 */}
      <SkyBar totalCherries={totalCherries} />

      {/* 核心采摘区域：传递樱桃数和更新函数 */}
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
        <CherryTree
          totalCherries={totalCherries}
          onUpdateTotalCherries={handleUpdateTotalCherries}
        />
      </div>
    </div>
  );
}