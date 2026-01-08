import { supabase } from './supabaseClient';

/**
 * 获取今日日期（UTC 格式，确保跨时区一致性）
 * @returns {string} 格式：YYYY-MM-DD
 */
const getTodayDate = () => {
  const now = new Date();
  // 转为 UTC 日期字符串（截取前10位）
  return now.toISOString().slice(0, 10);
};

/**
 * 判断用户今日是否已摘樱桃
 * @param {{id: number, username: string}} user Telegram 用户信息
 * @returns {Promise<boolean>} true=已摘，false=未摘
 */
export async function hasPickedToday(user) {
  if (!user?.id) return false;

  const today = getTodayDate();
  try {
    const { count, error } = await supabase
      .from('cherry_picks')
      .select('id', { head: true, count: 'exact' })
      .eq('user_id', user.id)
      .eq('picked_at', today);

    if (error) throw error;
    return count > 0;
  } catch (error) {
    console.error('检查今日采摘状态失败:', error);
    alert('无法检查采摘状态，请重试');
    return false;
  }
}

/**
 * 获取用户总樱桃数
 * @param {{id: number, username: string}} user Telegram 用户信息
 * @returns {Promise<number>} 总樱桃数（默认0）
 */
export async function getTotalCherries(user) {
  if (!user?.id) return 0;

  try {
    const { count, error } = await supabase
      .from('cherry_picks')
      .select('id', { head: true, count: 'exact' })
      .eq('user_id', user.id);

    if (error) throw error;
    return count ?? 0;
  } catch (error) {
    console.error('获取总樱桃数失败:', error);
    alert('无法获取樱桃数量，请重试');
    return 0;
  }
}

/**
 * 用户摘樱桃（插入今日记录并返回总数量）
 * @param {{id: number, username: string}} user Telegram 用户信息
 * @returns {Promise<number>} 采摘后的总樱桃数
 */
export async function pickCherry(user) {
  if (!user?.id) throw new Error('用户信息无效');
  if (await hasPickedToday(user)) throw new Error('今日已采摘过樱桃');

  const today = getTodayDate();
  try {
    // 插入今日采摘记录
    const { error: insertError } = await supabase.from('cherry_picks').insert([
      {
        user_id: user.id,
        username: user.username,
        picked_at: today
      }
    ]);

    if (insertError) throw insertError;

    // 返回最新总数量
    return await getTotalCherries(user);
  } catch (error) {
    console.error('采摘樱桃失败:', error);
    throw new Error(`采摘失败：${error.message}`);
  }
}

// 新增：初始化用户累计数据
async function initUserTotalCherries(user) {
  const { data, error } = await supabase
    .from('cherry_users')
    .select('total_cherries')
    .eq('user_id', user.id)
    .single();

  if (error && error.code === 'PGRST116') { // 无用户记录，创建新记录
    await supabase.from('cherry_users').insert([
      { user_id: user.id, username: user.username, total_cherries: 0 }
    ]);
    return 0;
  }
  return data?.total_cherries || 0;
}

// 改造：获取累计樱桃数（直接读 total_cherries 字段，更快）
export async function getTotalCherries(user) {
  if (!user?.id) return 0;
  return await initUserTotalCherries(user);
}

// 改造：采摘樱桃时，直接更新累计数
export async function pickCherry(user) {
  if (!user?.id) throw new Error('用户信息无效');
  const today = getTodayDate();

  // 检查今日是否已摘
  const { data: userData } = await supabase
    .from('cherry_users')
    .select('last_picked_at')
    .eq('user_id', user.id)
    .single();

  if (userData?.last_picked_at === today) {
    throw new Error('今日已采摘过樱桃');
  }

  // 1. 更新累计樱桃数（+1）
  const { error: updateError } = await supabase
    .from('cherry_users')
    .update({
      total_cherries: supabase.raw('total_cherries + 1'),
      last_picked_at: today
    })
    .eq('user_id', user.id);

  if (updateError) throw updateError;

  // 2. （可选）仍插入采摘记录，用于溯源
  await supabase.from('cherry_picks').insert([
    { user_id: user.id, username: user.username, picked_at: today }
  ]);

  // 3. 返回最新累计数
  const { data: newUserData } = await supabase
    .from('cherry_users')
    .select('total_cherries')
    .eq('user_id', user.id)
    .single();

  return newUserData.total_cherries;
}