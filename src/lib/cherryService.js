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