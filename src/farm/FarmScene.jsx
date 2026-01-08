import SkyBar from './SkyBar'
import CherryTree from './CherryTree'
// 后续可以解注释其他组件
// import CherryBasket from './CherryBasket'
// import FarmStatusSign from './FarmStatusSign'
// import FarmHut from './FarmHut'
import './firstScreen.css'

export default function FarmScene() {
  return (
    <div className="farm-container">
      <SkyBar />
      
      {/* 主游戏区域 */}
      <div className="farm-main">
        <div className="farm-visual">
          <CherryTree />
        </div>
        
        {/* 未来可以添加更多农场组件 */}
        {/* <div className="farm-sidebar">
          <CherryBasket />
          <FarmStatusSign />
          <FarmHut />
        </div> */}
      </div>
      
      {/* 农场装饰 */}
      <div className="farm-decoration">
        <div className="grass"></div>
        <div className="fence fence-left"></div>
        <div className="fence fence-right"></div>
      </div>
    </div>
  )
}