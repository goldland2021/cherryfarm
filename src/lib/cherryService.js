import { supabase } from './supabaseClient';

// 全局配置（防刷上限）
export const CONFIG = {
  BASE_PICK_TIMES: 5, // 基础采摘次数
  MAX_AD_COUNT: 5,    // 每日最多看广告次数
  MAX_DAILY_PICK: 10, // 每日最大可采摘总数（防刷锁上限）
  AD_REWARD_TIMES: 1  // 每次广告奖励次数
};

/**
 * 初始化用户数据（无则创建，有则重置今日次数）
 */
export async function initUserInDB(user) {
  if (!user?.id) throw new Error('用户ID不能为空');
  
  // 先查询用户是否存在
  const { data: existingUser } = await supabase
    .from('cherry_users')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (existingUser) {
    // 重置今日次数（若跨天）
    const today = new Date().toISOString().split('T')[0];
    const userUpdateDate = new Date(existingUser.updated_at).toISOString().split('T')[0];
    if (userUpdateDate !== today) {
      await supabase
        .from('cherry_users')
        .update({
          today_picked_count: 0,
          today_ad_count: 0,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      return { ...existingUser, today_picked_count: 0, today_ad_count: 0 };
    }
    return existingUser;
  } else {
    // 新建用户（设置防刷上限）
    const { data: newUser } = await supabase
      .from('cherry_users')
      .insert([
        {
          user_id: user.id,
          username: user.username || '未知用户',
          total_cherries: 0,
          today_picked_count: 0,
          today_ad_count: 0,
          max_daily_pick: CONFIG.MAX_DAILY_PICK
        }
      ])
      .select()
      .single();
    return newUser;
  }
}

/**
 * 采摘樱桃（带防刷校验）
 */
export async function pickCherry(user) {
  const userData = await initUserInDB(user);
  
  // 防刷校验：是否超过每日最大次数
  if (userData.today_picked_count >= userData.max_daily_pick) {
    throw new Error(`今日已达最大采摘次数（${userData.max_daily_pick}次），明天再来吧！`);
  }

  // 数据库事务：更新已摘次数 + 累计樱桃数
  const today = new Date().toISOString().slice(0, 10);
  const { error: pickError } = await supabase.rpc('update_pick_count', {
    p_user_id: user.id,
    p_today: today
  });

  if (pickError) {
    console.error('采摘防刷校验失败:', pickError);
    throw new Error('采摘失败，系统检测到异常操作！');
  }

  // 插入采摘记录（兼容原有逻辑）
  await supabase.from('cherry_picks').insert([
    { user_id: user.id, username: user.username, picked_at: today }
  ]);

  // 返回最新数据
  const { data: updatedUser } = await supabase
    .from('cherry_users')
    .select('today_picked_count, total_cherries')
    .eq('user_id', user.id)
    .single();
  
  return updatedUser.total_cherries;
}

/**
 * 看广告增加采摘次数（带防刷校验）
 */
export async function watchAdAddPickTimes(user) {
  const userData = await initUserInDB(user);
  
  // 防刷校验1：是否超过每日最大广告次数
  if (userData.today_ad_count >= CONFIG.MAX_AD_COUNT) {
    throw new Error(`今日已看${CONFIG.MAX_AD_COUNT}次广告，明天再来吧！`);
  }

  // 防刷校验2：广告奖励后是否超过最大采摘总数
  const newAdCount = userData.today_ad_count + 1;
  const newMaxPick = CONFIG.BASE_PICK_TIMES + newAdCount * CONFIG.AD_REWARD_TIMES;
  if (newMaxPick > userData.max_daily_pick) {
    throw new Error(`广告奖励后次数将超过每日上限（${userData.max_daily_pick}次），无法继续看广告！`);
  }

  // 更新数据库广告次数
  const { data: updatedUser } = await supabase
    .from('cherry_users')
    .update({
      today_ad_count: newAdCount,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id)
    .select('today_ad_count')
    .single();

  return {
    adCount: updatedUser.today_ad_count,
    extraPickTimes: updatedUser.today_ad_count * CONFIG.AD_REWARD_TIMES
  };
}

/**
 * 获取用户今日采摘/广告次数（从数据库读取，防刷核心）
 */
export async function getUserDailyCounts(user) {
  const userData = await initUserInDB(user);
  return {
    todayPickedCount: userData.today_picked_count,
    todayAdCount: userData.today_ad_count,
    maxDailyPick: userData.max_daily_pick,
    extraPickTimes: userData.today_ad_count * CONFIG.AD_REWARD_TIMES
  };
}

/**
 * 获取累计樱桃数（从数据库读取）
 */
export async function getTotalCherries(user) {
  const userData = await initUserInDB(user);
  return userData.total_cherries;
}

// 可选：创建Supabase RPC函数（提升事务安全性，防刷关键）
// 执行以下SQL在Supabase控制台：
/*
CREATE OR REPLACE FUNCTION update_pick_count(p_user_id BIGINT, p_today TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE cherry_users
  SET 
    today_picked_count = today_picked_count + 1,
    total_cherries = total_cherries + 1,
    updated_at = NOW()
  WHERE 
    user_id = p_user_id 
    AND today_picked_count < max_daily_pick;
END;
$$ LANGUAGE plpgsql;
*/