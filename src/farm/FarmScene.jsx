import { useState } from 'react';
import SkyBar from './SkyBar';
import CherryTree from './CherryTree';
// 导入背景图（关键新增）
import FarmBg from '../assets/farm-bg.png';

export default function FarmScene() {
  const [totalCherries, setTotalCherries] = useState(0);

  const handleUpdateTotalCherries = (newTotal) => {
    setTotalCherries(newTotal);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        // 背景图核心样式（关键新增）
        backgroundImage: `url(${FarmBg})`, // 引入背景图
        backgroundSize: 'cover', // 覆盖整个容器，适配屏幕
        backgroundPosition: 'center', // 背景居中显示
        backgroundRepeat: 'no-repeat', // 不重复
        backgroundAttachment: 'fixed', // 固定背景，滚动不移动
        // 加一层半透明遮罩，避免背景太亮遮挡内容（可选，可调整透明度）
        backgroundColor: 'rgba(15, 23, 42, 0.85)', 
        backgroundBlendMode: 'overlay',
        // 原有样式保留
        color: '#e5e7eb',
        paddingBottom: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* 顶部导航栏（樱桃数显示不变） */}
      <SkyBar totalCherries={totalCherries} />

      {/* 核心采摘区域（原有样式不变） */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          padding: '20px',
          // 可选：给内容加轻微半透明背景，提升可读性
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          borderRadius: 16,
          margin: '0 10px',
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