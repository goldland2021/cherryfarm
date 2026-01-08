import { supabase } from './supabaseClient';

/**
 * 获取今日日期（UTC 格式，避免时区问题）
 * @returns {string} 格式：YYYY-MM-DD
 */
const getTodayDate = () => {
  const now = new Date();
  return now.toISOString().slice(0, 10);
};

/**
 * 获取用户今日已采摘次数
 * @param {{id: number, username: string}} user Telegram 用户信息
 * @returns {Promise<number>} 今日已采摘次数
 */
export async function getTodayPickedCount(user) {
  if (!user?.id) return 0;

  const today = getTodayDate();
  try {
    const { count, error } = await supabase
      .from('cherry_picks')
      .select('id', { head: true, count: 'exact' })
      .eq('user_id', user.id)
      .eq('picked_at', today);

    if (error) throw error;
    return count ?? 0;
  } catch (error) {
    console.error('获取今日采摘次数失败:', error);
    return 0;
  }
}

/**
 * 判断用户今日是否达到采摘上限（5次）
 * @param {{id: number, username: string}} user Telegram 用户信息
 * @returns {Promise<boolean>} true=已达上限，false=可继续采摘
 */
export async function hasReachedDailyLimit(user) {
  const todayCount = await getTodayPickedCount(user);
  return todayCount >= 5; // 每日最多5次
}

/**
 * 获取用户累计樱桃总数
 * @param {{id: number, username: string}} user Telegram 用户信息
 * @returns {Promise<number>} 累计樱桃数
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
    console.error('获取累计樱桃数失败:', error);
    alert('⚠️ 无法获取你的樱桃数量，请重试');
    return 0;
  }
}

/**
 * 用户采摘樱桃（每日最多5次）
 * @param {{id: number, username: string}} user Telegram 用户信息
 * @returns {Promise<number>} 采摘后的累计樱桃数
 * @throws {Error} 采摘失败时抛出错误
 */
export async function pickCherry(user) {
  if (!user?.id) throw new Error('用户信息无效');
  
  // 检查今日是否已达上限
  const hasLimit = await hasReachedDailyLimit(user);
  if (hasLimit) throw new Error('今日已采摘5次，明天再来吧～');

  const today = getTodayDate();
  try {
    // 插入采摘记录
    const { error: insertError } = await supabase.from('cherry_picks').insert([
      {
        user_id: user.id,
        username: user.username,
        picked_at: today
      }
    ]);

    if (insertError) throw insertError;

    // 返回最新累计数
    return await getTotalCherries(user);
  } catch (error) {
    console.error('采摘樱桃失败:', error);
    throw new Error(`采摘失败：${error.message}`);
  }
}