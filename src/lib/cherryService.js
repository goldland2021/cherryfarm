import { supabase } from './supabaseClient'

/**
 * 获取用户总樱桃数
 */
export async function getTotalCherries(user) {
  const { count, error } = await supabase
    .from('cherry_picks')
    .select('id', { head: true, count: 'exact' })
    .eq('user_id', user.id)

  if (error) {
    console.error('getTotalCherries error:', error)
    return 0
  }
  return count ?? 0
}

/**
 * 判断用户今天是否已摘樱桃
 */
export async function hasPickedToday(user) {
  const today = new Date().toISOString().split('T')[0]  // 更清晰的日期格式
  const { count, error } = await supabase
    .from('cherry_picks')
    .select('id', { head: true, count: 'exact' })
    .eq('user_id', user.id)
    .eq('picked_at', today)

  if (error) {
    console.error('hasPickedToday error:', error)
    return false
  }
  return count > 0
}

/**
 * 用户摘樱桃
 */
export async function pickCherry(user) {
  const today = new Date().toISOString().split('T')[0]

  // 先检查今天是否已摘（双重保险）
  const alreadyPicked = await hasPickedToday(user)
  if (alreadyPicked) {
    throw new Error('今天已经摘过樱桃了')
  }

  // 插入记录
  const { error: insertError } = await supabase
    .from('cherry_picks')
    .insert([{ 
      user_id: user.id, 
      username: user.username, 
      picked_at: today 
    }])

  if (insertError) {
    console.error('pickCherry insert error:', insertError)
    throw insertError
  }

  // 返回新的总樱桃数
  return await getTotalCherries(user)
}