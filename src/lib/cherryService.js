import { supabase } from './supabaseClient';

// 配置：每日可采摘次数（直接写死，前端简单校验）
export const CONFIG = {
  DAILY_PICK_LIMIT: 10 // 每日最多摘10次，前端简单校验
};

// 获取今日已采摘次数（仅统计cherry_picks表）
export async function getTodayPickedCount(user) {
  if (!user?.id) return 0;
  const today = new Date().toISOString().slice(0, 10);
  const { count } = await supabase
    .from('cherry_picks')
    .select('id', { head: true, count: 'exact' })
    .eq('user_id', user.id)
    .eq('picked_at', today);
  return count || 0;
}

// 采摘樱桃（仅插入记录，无防刷校验）
export async function pickCherry(user) {
  if (!user?.id) throw new Error('请在Telegram中打开应用');
  
  // 前端简单校验（可选，防止误点）
  const todayCount = await getTodayPickedCount(user);
  if (todayCount >= CONFIG.DAILY_PICK_LIMIT) {
    throw new Error(`今日已摘${CONFIG.DAILY_PICK_LIMIT}次，明天再来吧～`);
  }

  // 仅插入采摘记录（核心逻辑）
  const today = new Date().toISOString().slice(0, 10);
  await supabase.from('cherry_picks').insert([
    { user_id: user.id, username: user.username, picked_at: today }
  ]);

  // 返回累计樱桃数
  const { count } = await supabase
    .from('cherry_picks')
    .select('id', { head: true, count: 'exact' })
    .eq('user_id', user.id);
  return count || 0;
}

// 获取累计樱桃数
export async function getTotalCherries(user) {
  if (!user?.id) return 0;
  const { count } = await supabase
    .from('cherry_picks')
    .select('id', { head: true, count: 'exact' })
    .eq('user_id', user.id);
  return count || 0;
}