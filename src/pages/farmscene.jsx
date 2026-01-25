// src/pages/farmscene.jsx
// 农场场景页面入口：整合通用登录组件 + 农场业务组件
import TgLogin from '../components/TgLogin';
import FarmScene from '../farm/FarmScene';

// 直接导出：TgLogin包裹FarmScene，透传登录状态（user/isLoading）
export default function FarmScenePage() {
  return (
    <TgLogin>
      {/* 回调式children：接收TgLogin的登录状态，透传给农场业务组件 */}
      {({ user, isLoading }) => <FarmScene user={user} isLoading={isLoading} />}
    </TgLogin>
  );
}