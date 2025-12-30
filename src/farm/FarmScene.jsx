import SkyBar from './SkyBar'
import CherryTree from './CherryTree'
import CherryBasket from './CherryBasket'
import FarmStatusSign from './FarmStatusSign'
import FarmHut from './FarmHut'

export default function FarmScene() {
  return (
    <div style={{ paddingBottom: 40 }}>
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
        <CherryBasket />
      </div>

      <FarmStatusSign />
      <FarmHut />
    </div>
  )
}
