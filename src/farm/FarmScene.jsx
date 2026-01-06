import SkyBar from './SkyBar'
import CherryTree from './CherryTree'
// ❌ 暂时不用的全部先注释
// import CherryBasket from './CherryBasket'
// import FarmStatusSign from './FarmStatusSign'
// import FarmHut from './FarmHut'

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
  )
}
